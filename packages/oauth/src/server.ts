// @mungsan/oauth — 카카오·네이버·구글 OAuth2 Authorization Code Grant의 얇은 어댑터.
// 순수 프로토콜 로직만 담고 클라이언트 자격(clientId/clientSecret/redirectUri)은 호출부가 주입한다.
// @mungsan/email 동형으로 process.env를 직접 읽지 않으며, 교환한 토큰은 프로필 1회 조회 후 폐기한다(미저장).

export type OAuthProfile = {
  providerAccountId: string;
  email: string | null;
  name: string | null;
};

export type ProviderName = 'KAKAO' | 'NAVER' | 'GOOGLE';

export type ProviderCreds = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type OAuthProvider = {
  buildAuthorizeUrl(args: { creds: ProviderCreds; state: string }): string;
  exchangeCode(args: { creds: ProviderCreds; code: string }): Promise<OAuthProfile>;
};

// provider별로 다른 부분만 선언으로 분리한다(엔드포인트·scope·프로필 파서).
// authorize URL 조립과 토큰→프로필 교환 골격은 전 provider 공통이다.
type ProviderSpec = {
  authorizeEndpoint: string;
  tokenEndpoint: string;
  profileEndpoint: string;
  scope?: string; // 네이버는 콘솔에서 scope를 관리하므로 authorize 쿼리에 넣지 않는다.
  parseProfile(raw: unknown): OAuthProfile;
};

const SPECS: Record<ProviderName, ProviderSpec> = {
  KAKAO: {
    authorizeEndpoint: 'https://kauth.kakao.com/oauth/authorize',
    tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
    profileEndpoint: 'https://kapi.kakao.com/v2/user/me',
    scope: 'account_email profile_nickname',
    parseProfile(raw) {
      const r = raw as {
        id: number;
        kakao_account?: { email?: string; profile?: { nickname?: string } };
      };
      // 카카오 id는 number라 String으로 정규화. email은 선택 동의라 미동의 시 없을 수 있다(→ null).
      return {
        providerAccountId: String(r.id),
        email: r.kakao_account?.email ?? null,
        name: r.kakao_account?.profile?.nickname ?? null,
      };
    },
  },
  NAVER: {
    authorizeEndpoint: 'https://nid.naver.com/oauth2.0/authorize',
    tokenEndpoint: 'https://nid.naver.com/oauth2.0/token',
    profileEndpoint: 'https://openapi.naver.com/v1/nid/me',
    parseProfile(raw) {
      // 네이버는 프로필을 response 래퍼로 감싸 반환한다.
      const r = raw as { response: { id: string; email?: string; name?: string } };
      return {
        providerAccountId: r.response.id,
        email: r.response.email ?? null,
        name: r.response.name ?? null,
      };
    },
  },
  GOOGLE: {
    authorizeEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    profileEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    parseProfile(raw) {
      // 구글 OpenID Connect userinfo의 안정 식별자는 sub.
      const r = raw as { sub: string; email?: string; name?: string };
      return {
        providerAccountId: r.sub,
        email: r.email ?? null,
        name: r.name ?? null,
      };
    },
  },
};

function buildAuthorizeUrl(
  spec: ProviderSpec,
  args: { creds: ProviderCreds; state: string },
): string {
  const url = new URL(spec.authorizeEndpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', args.creds.clientId);
  url.searchParams.set('redirect_uri', args.creds.redirectUri);
  url.searchParams.set('state', args.state); // 콜백 CSRF 대조용
  if (spec.scope) url.searchParams.set('scope', spec.scope);
  return url.toString();
}

async function exchangeCode(
  spec: ProviderSpec,
  args: { creds: ProviderCreds; code: string },
): Promise<OAuthProfile> {
  // 1) 인가코드 → 액세스 토큰 (form-urlencoded POST)
  const tokenRes = await fetch(spec.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: args.creds.clientId,
      client_secret: args.creds.clientSecret,
      redirect_uri: args.creds.redirectUri,
      code: args.code,
    }),
  });
  // 토큰 교환/프로필 조회 실패는 예측 불가한 인프라 치명상에 가깝고, 콜백 라우트가 잡아 에러로 redirect하므로 throw.
  if (!tokenRes.ok) throw new Error(`[oauth] 토큰 교환 실패: ${tokenRes.status}`);
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error('[oauth] 토큰 응답에 access_token 없음');

  // 2) 액세스 토큰 → 프로필. 토큰은 여기서만 쓰고 반환 후 폐기한다(미저장).
  const profileRes = await fetch(spec.profileEndpoint, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileRes.ok) throw new Error(`[oauth] 프로필 조회 실패: ${profileRes.status}`);

  return spec.parseProfile(await profileRes.json());
}

export function getOAuthProvider(name: ProviderName): OAuthProvider {
  const spec = SPECS[name];
  return {
    buildAuthorizeUrl: (args) => buildAuthorizeUrl(spec, args),
    exchangeCode: (args) => exchangeCode(spec, args),
  };
}

import { describe, it, expect, vi, afterEach } from 'vitest';

import { getOAuthProvider, type ProviderCreds } from './server';

const creds: ProviderCreds = {
  clientId: 'CID',
  clientSecret: 'SECRET',
  redirectUri: 'http://localhost:3000/cb',
};

// fetch Response 흉내(.ok/.status/.json). exchangeCode는 토큰→프로필 순서로 fetch를 2회 호출한다.
function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response;
}

// 토큰 응답 → 프로필 응답 순서로 global fetch를 모킹한다.
function mockTokenThenProfile(profile: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse({ access_token: 'access-tok' }))
    .mockResolvedValueOnce(jsonResponse(profile));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exchangeCode 프로필 파싱', () => {
  it('KAKAO — number id를 String으로 정규화하고 nickname/email을 뽑는다', async () => {
    const fetchMock = mockTokenThenProfile({
      id: 1234567890,
      kakao_account: { email: 'k@test.kr', profile: { nickname: '카카오유저' } },
    });
    const profile = await getOAuthProvider('KAKAO').exchangeCode({ creds, code: 'CODE' });
    expect(profile).toEqual({
      providerAccountId: '1234567890',
      email: 'k@test.kr',
      name: '카카오유저',
    });
    // 토큰 POST → 프로필 GET 2회 호출 + 엔드포인트 확인
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://kauth.kakao.com/oauth/token');
    expect(fetchMock.mock.calls[1][0]).toBe('https://kapi.kakao.com/v2/user/me');
  });

  it('KAKAO — 이메일 동의 거부 시 email은 null', async () => {
    mockTokenThenProfile({ id: 42, kakao_account: { profile: { nickname: '닉' } } });
    const profile = await getOAuthProvider('KAKAO').exchangeCode({ creds, code: 'CODE' });
    expect(profile).toEqual({ providerAccountId: '42', email: null, name: '닉' });
  });

  it('NAVER — response 래퍼에서 id/email/name을 뽑는다', async () => {
    mockTokenThenProfile({ response: { id: 'naver-999', email: 'n@test.kr', name: '네이버' } });
    const profile = await getOAuthProvider('NAVER').exchangeCode({ creds, code: 'CODE' });
    expect(profile).toEqual({
      providerAccountId: 'naver-999',
      email: 'n@test.kr',
      name: '네이버',
    });
  });

  it('GOOGLE — sub를 providerAccountId로 쓴다', async () => {
    mockTokenThenProfile({ sub: 'google-sub-7', email: 'g@test.kr', name: 'Google User' });
    const profile = await getOAuthProvider('GOOGLE').exchangeCode({ creds, code: 'CODE' });
    expect(profile).toEqual({
      providerAccountId: 'google-sub-7',
      email: 'g@test.kr',
      name: 'Google User',
    });
  });

  it('토큰 교환 HTTP 실패 시 throw', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse({}, false, 401)));
    await expect(
      getOAuthProvider('KAKAO').exchangeCode({ creds, code: 'BAD' }),
    ).rejects.toThrow('토큰 교환 실패');
  });
});

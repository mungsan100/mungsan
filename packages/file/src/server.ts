import { del, issueSignedToken, presignUrl, put } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const DEFAULT_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_READ_EXPIRY_MS = 5 * 60 * 1000; // 5분

// Blob 저장소 레벨 접근 등급(2값). 도메인 3등급이 아니다 — PRIVATE→'private', MEMBER·PUBLIC→'public'.
export type BlobAccess = 'public' | 'private';

export type UploadedFile = {
  pathname: string;
  url: string;
  contentType: string;
};

export type UploadHandlerConfig = {
  // 토큰 발급 직전 인증 게이트. clientPayload(업로드 맥락)를 받아 판단하고,
  // falsy 반환(또는 throw) 시 업로드 거부.
  authorize: (clientPayload: string | null) => Promise<unknown>;
  allowedContentTypes?: string[];
  maxSizeBytes?: number;
};

// 클라이언트 직행 업로드용 토큰 발급 POST 핸들러를 만든다.
// 각 앱의 app/api/.../upload/route.ts 가 자신의 세션 인증을 주입해 사용한다.
//
// ⚠ 공개/비공개(access)는 이 서버 토큰이 아니라 브라우저 upload() 호출이 결정한다(2.5.0).
//   토큰은 업로더 인증·콘텐츠타입·크기만 강제한다. 서버가 access 를 강제해야 하는 민감
//   파일은 putFile(서버 업로드)을 쓴다.
export function createUploadHandler(config: UploadHandlerConfig) {
  return async function POST(request: Request): Promise<Response> {
    const body = (await request.json()) as HandleUploadBody;

    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (_pathname, clientPayload) => {
          const session = await config.authorize(clientPayload);
          if (!session) throw new Error('로그인이 필요합니다.');
          return {
            allowedContentTypes: config.allowedContentTypes ?? DEFAULT_CONTENT_TYPES,
            // pathname 의 uniqueness 는 client(uploadFile)가 uuid 로 보장한다.
            addRandomSuffix: false,
            maximumSizeInBytes: config.maxSizeBytes ?? DEFAULT_MAX_BYTES,
          };
        },
        // onUploadCompleted 미지정: 추적 row 없이 pathname 을 사용처 엔티티에 직접 저장하므로
        // 완료 콜백이 불필요하다. (지정 시 localhost 는 콜백 URL 미도달 경고가 뜬다.)
      });

      return Response.json(result);
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : '업로드에 실패했습니다.' },
        { status: 400 },
      );
    }
  };
}

// 서버에서 직접 Blob 으로 업로드한다(요청 본문 4.5MB 한도). access 를 서버가 강제하므로
// 사업자등록증·임원증빙 등 민감 파일의 안전한 경로다 — 브라우저가 access 를 낮출 수 없다.
// pathname 은 호출 command 가 생성해 넘긴다(uuid + 확장자).
export async function putFile(
  pathname: string,
  body: Parameters<typeof put>[1],
  options: { access: BlobAccess; contentType?: string },
): Promise<UploadedFile> {
  const blob = await put(pathname, body, {
    access: options.access,
    contentType: options.contentType,
    addRandomSuffix: false,
  });
  return { pathname: blob.pathname, url: blob.url, contentType: blob.contentType };
}

// 비공개 blob 을 열기 위한 시간제한 서명 URL 을 서버에서 발급한다. PRIVATE 파일의 열람 경로 —
// 앱이 본인·운영자 인가를 마친 뒤 호출하고 반환 URL 을 클라이언트에 넘긴다. 만료되면 무효.
export async function getSignedReadUrl(
  pathname: string,
  options?: { expiresInMs?: number },
): Promise<string> {
  const validUntil = Date.now() + (options?.expiresInMs ?? DEFAULT_READ_EXPIRY_MS);
  const token = await issueSignedToken({ pathname, operations: ['get'], validUntil });
  const { presignedUrl } = await presignUrl(token, {
    operation: 'get',
    pathname,
    access: 'private',
    validUntil,
  });
  return presignedUrl;
}

// blob 삭제. 소유 엔티티 삭제·첨부 제거 시 command 가 호출한다(무FK 라 DB cascade 가 없어
// 파일 정리를 쓰기 경로가 책임진다).
export async function deleteFile(pathname: string): Promise<void> {
  await del(pathname);
}

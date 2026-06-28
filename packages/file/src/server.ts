import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

const DEFAULT_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadHandlerConfig = {
  // 토큰 발급 직전 호출되는 인증 게이트. falsy 반환(또는 throw) 시 업로드 거부.
  authorize: () => Promise<unknown>;
  allowedContentTypes?: string[];
  maxSizeBytes?: number;
};

// 클라이언트 직행 업로드용 토큰 발급 POST 핸들러를 만든다.
// 각 앱의 app/api/.../upload/route.ts 가 자신의 세션 인증을 주입해 사용한다.
export function createUploadHandler(config: UploadHandlerConfig) {
  return async function POST(request: Request): Promise<Response> {
    const body = (await request.json()) as HandleUploadBody;

    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          const session = await config.authorize();
          if (!session) throw new Error('로그인이 필요합니다.');
          return {
            access: 'public',
            allowedContentTypes: config.allowedContentTypes ?? DEFAULT_CONTENT_TYPES,
            // pathname 의 uniqueness 는 client(uploadFile)가 uuid 로 보장한다.
            addRandomSuffix: false,
            maximumSizeInBytes: config.maxSizeBytes ?? DEFAULT_MAX_BYTES,
          };
        },
        // onUploadCompleted 미지정: 추적 row 없이 public URL 을 사용처 엔티티(컬럼)에 직접 저장하므로
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

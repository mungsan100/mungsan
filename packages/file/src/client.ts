import { upload } from '@vercel/blob/client';

// Blob 저장소 레벨 접근 등급(2값). 도메인 3등급(PRIVATE/MEMBER/PUBLIC)이 아니다 —
// 앱이 PRIVATE→'private', MEMBER·PUBLIC→'public' 으로 매핑해 넘긴다.
export type BlobAccess = 'public' | 'private';

// 업로드 결과. url 은 public blob 의 열람 URL 이다(private 는 이 URL 로 열리지 않는다 —
// 서버 getSignedReadUrl(pathname) 으로 서명 URL 을 만들어 연다). 앱은 pathname 을 저장해
// 두고 등급별로 열람 경로를 고른다.
export type UploadedFile = {
  pathname: string;
  url: string;
  contentType: string;
};

// 파일을 브라우저에서 Blob 으로 직행 업로드한다(서버 액션 4.5MB 우회, 최대 5TB).
// 토큰 발급·인증은 handleUploadUrl 라우트(createUploadHandler)가 담당한다.
//
// access 는 명시 필수 — 조용한 'public' fallback 이 민감 파일을 노출시키지 않도록.
// ⚠ 2.5.0 client-upload 에서 access 는 브라우저가 assert 해 헤더로 보내며 서버 토큰이
//   강제하지 않는다. 서버가 access 를 강제해야 하는 민감 파일은 server 의 putFile 을 쓴다.
export async function uploadFile(
  file: File,
  handleUploadUrl: string,
  options: { access: BlobAccess; clientPayload?: string },
): Promise<UploadedFile> {
  // 경로는 file.name 대신 랜덤 uuid — 원본 파일명 노출·불안정 문자를 피하고 충돌을 차단한다
  // (확장자만 보존). uniqueness 를 여기서 책임지므로 서버 핸들러는 addRandomSuffix 를 끈다.
  const pathname = `${crypto.randomUUID()}${extname(file.name)}`;
  const blob = await upload(pathname, file, {
    access: options.access,
    handleUploadUrl,
    clientPayload: options.clientPayload,
  });
  return { pathname: blob.pathname, url: blob.url, contentType: blob.contentType };
}

function extname(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

import { upload } from '@vercel/blob/client';

// 파일을 Vercel Blob(public)으로 브라우저에서 직접 업로드하고 public URL 을 반환한다.
// 브라우저→Blob 직행(서버 액션 본문 4.5MB 제한 우회). 토큰 발급·인증은 handleUploadUrl
// 라우트(각 앱의 createUploadHandler)가 담당한다.
//
// 경로는 file.name 대신 랜덤 uuid 로 생성한다 — 원본 파일명 노출·불안정 문자(공백·유니코드)
// 를 피하고 충돌을 원천 차단한다(확장자만 보존). uniqueness 는 여기 한 곳에서 책임지므로
// 서버 핸들러는 addRandomSuffix 를 끈다.
export async function uploadFile(file: File, handleUploadUrl: string): Promise<string> {
  const pathname = `${crypto.randomUUID()}${extname(file.name)}`;
  const blob = await upload(pathname, file, {
    access: 'public',
    handleUploadUrl,
  });
  return blob.url;
}

function extname(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

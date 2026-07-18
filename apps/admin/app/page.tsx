import { redirect } from 'next/navigation';

// 운영 백오피스 홈 — 현재 유일한 운영 화면인 가입 심사 목록으로 보낸다.
export default function AdminHomePage() {
  redirect('/approvals');
}

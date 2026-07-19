'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENUS = [
  { href: '/approvals', label: '가입 심사' },
  { href: '/members', label: '회원 관리' },
  { href: '/reports', label: '신고 관리' },
  { href: '/contents', label: '콘텐츠 관리' },
  { href: '/metrics', label: '지표' },
];

// 백오피스 메뉴 탭 — 현재 경로 기준 활성 표시(usePathname 이 필요해 client).
export const BackNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {MENUS.map((menu) => {
        const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {menu.label}
          </Link>
        );
      })}
    </nav>
  );
};

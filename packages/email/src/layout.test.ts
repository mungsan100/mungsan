import { describe, it, expect } from 'vitest';
import { emailLayout } from './server';

describe('emailLayout', () => {
  it('heading과 body를 포함한다', () => {
    const html = emailLayout({ heading: '제목', body: '본문' });
    expect(html).toContain('제목');
    expect(html).toContain('본문');
  });

  it('cta가 있으면 링크 버튼을 렌더한다', () => {
    const html = emailLayout({ heading: 'h', body: 'b', cta: { label: '이동', href: 'https://x.test/y' } });
    expect(html).toContain('https://x.test/y');
    expect(html).toContain('이동');
  });

  it('cta가 없으면 버튼을 렌더하지 않는다', () => {
    const html = emailLayout({ heading: 'h', body: 'b' });
    expect(html).not.toContain('<a ');
  });
});

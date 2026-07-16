import { describe, it, expect } from 'vitest';

import { getOAuthProvider, type ProviderCreds } from './server';

const creds: ProviderCreds = {
  clientId: 'CID',
  clientSecret: 'SECRET',
  redirectUri: 'http://localhost:3000/api/auth/oauth/kakao/callback',
};

describe('buildAuthorizeUrl', () => {
  it('KAKAO — 카카오 authorize 엔드포인트와 client_id/redirect_uri/state/scope를 담는다', () => {
    const raw = getOAuthProvider('KAKAO').buildAuthorizeUrl({ creds, state: 'st-123' });
    const url = new URL(raw);
    expect(url.origin + url.pathname).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('CID');
    expect(url.searchParams.get('redirect_uri')).toBe(creds.redirectUri);
    expect(url.searchParams.get('state')).toBe('st-123');
    expect(url.searchParams.get('scope')).toBe('account_email profile_nickname');
  });

  it('NAVER — 네이버 authorize 엔드포인트를 쓰고 scope 쿼리는 넣지 않는다', () => {
    const raw = getOAuthProvider('NAVER').buildAuthorizeUrl({ creds, state: 'st-naver' });
    const url = new URL(raw);
    expect(url.origin + url.pathname).toBe('https://nid.naver.com/oauth2.0/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('CID');
    expect(url.searchParams.get('state')).toBe('st-naver');
    expect(url.searchParams.has('scope')).toBe(false);
  });

  it('GOOGLE — 구글 authorize 엔드포인트와 openid email profile scope를 담는다', () => {
    const raw = getOAuthProvider('GOOGLE').buildAuthorizeUrl({ creds, state: 'st-g' });
    const url = new URL(raw);
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('scope')).toBe('openid email profile');
    expect(url.searchParams.get('state')).toBe('st-g');
  });
});

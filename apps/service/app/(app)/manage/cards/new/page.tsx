'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { LuChevronLeft, LuCamera, LuLoaderCircle, LuSparkles } from 'react-icons/lu';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBusinessCardAction } from '../commands/create-business-card.action';
import { scanBusinessCardAction } from '../commands/scan-business-card.action';

type Fields = { name: string; company: string; jobTitle: string; phone: string; email: string };
const EMPTY_FIELDS: Fields = { name: '', company: '', jobTitle: '', phone: '', email: '' };

// 선택 이미지를 캔버스로 최대 1400px·JPEG 압축 → data URL. 서버 액션 본문 한도(1MB) 안에 들도록,
// 그리고 비전 토큰·저장 용량을 줄이려 축소한다(명함 OCR엔 이 해상도로 충분).
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('이미지를 열지 못했습니다.'));
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('이미지 처리를 지원하지 않는 환경입니다.'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// 명함 추가 — 촬영/업로드 → AI 인식(5필드 자동 채움) → 수정 → 저장.
export default function NewBusinessCardPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanned, setScanned] = useState(false);

  async function onPick(file: File | undefined) {
    if (!file) return;
    let dataUrl: string;
    try {
      dataUrl = await compressImage(file);
    } catch {
      toast.error('이미지를 불러오지 못했습니다. 다른 사진으로 시도해 주세요.');
      return;
    }
    setImage(dataUrl);
    setFields(EMPTY_FIELDS);
    setScanned(false);
    // 이미지 선택 즉시 AI 인식 시도(실패해도 수동 입력 가능).
    setScanning(true);
    const result = await scanBusinessCardAction(dataUrl);
    setScanning(false);
    setScanned(true);
    if (result.ok) {
      setFields(result.data);
      const filled = Object.values(result.data).filter(Boolean).length;
      toast.success(filled > 0 ? `${filled}개 항목을 자동으로 채웠어요. 확인·수정해 주세요.` : '자동 인식이 어려워요. 직접 입력해 주세요.');
    } else {
      toast.error(result.message);
    }
  }

  async function save() {
    if (!image) return;
    setSaving(true);
    const result = await createBusinessCardAction({ imageDataUrl: image, ...fields });
    if (!result.ok) {
      setSaving(false);
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push('/manage');
    router.refresh();
  }

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <header className="bg-canvas px-5 pt-12 pb-1">
        <Link
          href="/manage"
          className="text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 text-sm font-semibold"
        >
          <LuChevronLeft className="h-4 w-4" /> 명함첩
        </Link>
      </header>

      <div className="space-y-5 px-5 pt-3 pb-24">
        <div>
          <h1 className="text-ink-900 text-xl font-bold">명함 추가</h1>
          <p className="text-ink-500 mt-1 text-[13px]">
            명함을 촬영하거나 사진을 올리면 AI가 정보를 읽어 자동으로 채워줍니다. 저장 전에 수정할 수 있어요.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />

        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- 로컬 data URL 미리보기(원격 최적화 대상 아님)
          <img
            src={image}
            alt="명함 미리보기"
            className="border-ink-100 w-full rounded-2xl border object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-ink-200 text-ink-500 flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed"
          >
            <LuCamera className="h-8 w-8" />
            <span className="text-sm font-semibold">명함 촬영 / 사진 올리기</span>
          </button>
        )}

        {image && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-brand text-sm font-semibold underline underline-offset-2"
          >
            다른 사진으로 다시 선택
          </button>
        )}

        {scanning && (
          <div className="text-ink-500 flex items-center gap-2 text-sm">
            <LuLoaderCircle className="h-4 w-4 animate-spin" />
            <LuSparkles className="text-brand h-4 w-4" /> 명함을 읽는 중…
          </div>
        )}

        {image && scanned && !scanning && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bc-name">이름</Label>
              <Input id="bc-name" value={fields.name} onChange={set('name')} placeholder="이름" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-company">회사</Label>
              <Input id="bc-company" value={fields.company} onChange={set('company')} placeholder="회사명" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-job">직책</Label>
              <Input id="bc-job" value={fields.jobTitle} onChange={set('jobTitle')} placeholder="직책" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-phone">연락처</Label>
              <Input id="bc-phone" value={fields.phone} onChange={set('phone')} placeholder="연락처" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bc-email">이메일</Label>
              <Input id="bc-email" value={fields.email} onChange={set('email')} placeholder="이메일" />
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={saving}
              onClick={save}
            >
              {saving && <LuLoaderCircle className="h-5 w-5 animate-spin" />}
              명함 저장
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

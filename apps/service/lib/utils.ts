import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 조건부 클래스를 병합한다. clsx로 클래스를 합치고
 * tailwind-merge로 충돌하는 Tailwind 유틸리티를 정리한다.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

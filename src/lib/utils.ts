import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(number: number) {
  if (number < 1000) return number.toString();
  if (number < 1000000) return (number / 1000).toFixed(1) + 'K';
  return (number / 1000000).toFixed(1) + 'M';
}

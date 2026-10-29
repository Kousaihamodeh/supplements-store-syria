import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SY' : 'en-US').format(amount);
  return `${formatted} $`;
}

export function formatShippingFee(fee: number, governorate?: string, locale: 'ar' | 'en' = 'ar'): string {
  if (
    governorate?.includes('ريف دمشق') ||
    governorate?.toLowerCase().includes('rif') ||
    fee <= 0
  ) {
    return locale === 'ar'
      ? 'سيتم التواصل معك وتحديد الأجرة'
      : 'Fee determined upon contact';
  }
  const formatted = new Intl.NumberFormat('en-US').format(fee);
  return `${formatted} ${locale === 'ar' ? 'ل.س' : 'SYP'}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

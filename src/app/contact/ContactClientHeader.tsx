'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function ContactClientHeader() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
      <h1 className="text-3xl sm:text-4xl font-black text-white">
        {isRtl ? 'تواصل معنا' : 'Contact Us'}
      </h1>
      <p className="text-sm sm:text-base text-zinc-300">
        {isRtl
          ? 'نحن هنا لخدمتك دائماً. تواصل معنا عبر الهاتف، الواتساب، الإنستغرام أو تفضل بزيارة متجرنا مباشرة.'
          : 'We are always here to help. Reach out via Phone, WhatsApp, Instagram, or visit our store directly.'}
      </p>
    </div>
  );
}

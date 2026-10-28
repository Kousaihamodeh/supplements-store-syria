'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function WhatsAppButton() {
  const { locale } = useLanguage();
  return (
    <a
      href="https://wa.me/963938229497"
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-6 ltr:right-6 rtl:left-6 z-40 items-center gap-2 px-4 py-3.5 rounded-full bg-emerald-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.45)] hover:bg-emerald-400 hover:scale-105 transition-all duration-300 group border-2 border-emerald-300/50"
      aria-label="Contact us on WhatsApp 0938229497"
      title="WhatsApp: 0938229497"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current shrink-0" />
      <span className="text-xs font-extrabold tracking-wide pr-0.5">
        {locale === 'ar' ? 'واتساب' : 'WhatsApp'}
      </span>
    </a>
  );
}

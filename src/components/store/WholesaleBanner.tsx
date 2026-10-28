'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Dumbbell, PhoneCall, ArrowRight, ArrowLeft } from 'lucide-react';

export function WholesaleBanner() {
  const { locale, t } = useLanguage();
  const isRtl = locale === 'ar';

  return (
    <section className="py-12 bg-gradient-to-r from-dark-950 via-dark-900 to-dark-950 border-y border-dark-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:ltr:text-left md:rtl:text-right">
          <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shrink-0">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {t.wholesaleTitle}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl">
              {t.wholesaleSubtitle}
            </p>
          </div>
        </div>

        <Link
          href="/wholesale"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-sm sm:text-base hover:bg-neon-bright hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{t.wholesaleContactBtn}</span>
          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    </section>
  );
}

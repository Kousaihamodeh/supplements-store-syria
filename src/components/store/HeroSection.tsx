'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ArrowRight, ArrowLeft, MapPin, Phone, ShieldCheck, Truck, Zap } from 'lucide-react';

export function HeroSection({ settings }: { settings?: any }) {
  const { locale, t } = useLanguage();
  const isRtl = locale === 'ar';

  const title = isRtl
    ? settings?.heroTitleAr || 'كل ما تحتاجه لأداء أقوى'
    : settings?.heroTitleEn || 'Fuel Your Performance.';

  const subtitle = isRtl
    ? settings?.heroSubtitleAr || 'أحدث المكملات الغذائية الرياضية العالمية الأصلية 100% مع خدمة التوصيل السريع إلى جميع المحافظات السورية.'
    : settings?.heroSubtitleEn || '100% Authentic international sports nutrition supplements shipped fast across all Syrian governorates.';

  const googleMapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=33.488506,36.340218';

  return (
    <section className="relative overflow-hidden bg-dark-950 text-white py-8 sm:py-14 lg:py-24 border-b border-dark-800">
      {/* Glow Backdrop */}
      <div className="absolute top-1/4 ltr:left-1/4 rtl:right-1/4 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-neon-glow blur-3xl rounded-full pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
        
        {/* Left / Right Hero Text Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:ltr:text-left lg:rtl:text-right">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-dark-900 border border-neon/40 text-[11px] sm:text-xs font-semibold text-neon shadow-lg">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>{t.heroBadge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
            {title.split(' ').map((word: string, idx: number) => (
              <span key={idx} className={idx === title.split(' ').length - 1 ? 'text-neon inline' : ''}>
                {word}{' '}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1 sm:pt-4">
            {/* Primary CTA - Shop */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-xs sm:text-base hover:bg-neon-bright hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{t.shopNow}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Link>

            {/* Secondary CTA - Get Directions */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-dark-900 border border-dark-700 text-white font-bold text-xs sm:text-base hover:border-neon hover:text-neon transition-all"
            >
              <MapPin className="w-4 h-4 text-neon" />
              <span>{t.getDirections}</span>
            </a>

            {/* Third CTA - Contact Us */}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-dark-900/60 text-zinc-300 font-semibold text-xs sm:text-base hover:text-white hover:bg-dark-800 transition-all"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.contactUs}</span>
            </Link>
          </div>

          {/* Value Props Bar */}
          <div className="pt-4 sm:pt-8 border-t border-dark-800/80 grid grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-400">
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-neon shrink-0" />
              <span>{isRtl ? 'أصلية 100%' : '100% Authentic'}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-neon shrink-0" />
              <span>{isRtl ? 'شحن للمحافظات' : 'Fast Shipping'}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-neon shrink-0" />
              <span>{isRtl ? 'دمشق - جرمانا' : 'Damascus'}</span>
            </div>
          </div>
        </div>

        {/* Right Hero Image / Product Visual Showcase */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-[220px] sm:max-w-xs lg:max-w-md aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-tr from-dark-900 via-dark-800 to-dark-900 p-1.5 sm:p-2 border border-dark-700 shadow-2xl group">
            <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
              <Image
                src="/images/logo.jpg"
                alt="SUPPLEMENTS STORE"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80"></div>
              
              {/* Overlay Badge */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-2.5 sm:p-4 rounded-xl bg-dark-900/90 backdrop-blur-md border border-dark-700 text-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[11px] sm:text-sm text-neon truncate">SUPPLEMENTS STORE</h3>
                  <p className="text-[10px] sm:text-xs text-zinc-300 truncate">@supplement_store_syria</p>
                </div>
                <div className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-neon/20 border border-neon/40 text-neon font-extrabold text-[10px] sm:text-xs shrink-0">
                  Damascus
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

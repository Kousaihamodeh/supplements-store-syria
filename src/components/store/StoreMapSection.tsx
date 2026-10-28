'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { MapPin, Phone, MessageCircle, Instagram, ExternalLink, Navigation, Clock } from 'lucide-react';

interface StoreMapSectionProps {
  settings?: {
    addressAr?: string;
    addressEn?: string;
    googleMapsUrl?: string;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
  };
}

export function StoreMapSection({ settings }: StoreMapSectionProps) {
  const { locale, t } = useLanguage();
  const isRtl = locale === 'ar';

  const address = isRtl
    ? settings?.addressAr || 'دمشق – جرمانا – ساحة الكرامة – مقابل MTN'
    : settings?.addressEn || 'Damascus – Jaramana – Al-Karama Square – opposite MTN';

  const googleMapsUrl =
    settings?.googleMapsUrl ||
    'https://maps.google.com/?q=33.488506,36.340218';

  const lat = settings?.latitude || 33.488506;
  const lng = settings?.longitude || 36.340218;
  const embedMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

  const phone = settings?.phone || '0938229497';
  const whatsapp = settings?.whatsapp || '0938229497';
  const instagram = settings?.instagram || '@supplement_store_syria';

  return (
    <section className="py-16 bg-dark-900 border-b border-dark-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.storeAddressLabel}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t.visitStoreTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            {t.visitStoreSubtitle}
          </p>
        </div>

        {/* Content Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-5 bg-dark-950 p-6 sm:p-8 rounded-2xl border border-dark-700 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              
              {/* Address Row */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                    {t.storeAddressLabel}
                  </h4>
                  <p className="text-base sm:text-lg font-bold text-white mt-1">
                    {address}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4 pt-4 border-t border-dark-800">
                <div className="w-10 h-10 rounded-lg bg-dark-900 border border-dark-700 flex items-center justify-center text-zinc-300 shrink-0">
                  <Clock className="w-5 h-5 text-neon" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-zinc-400">
                    {isRtl ? 'أوقات الدوام' : 'Working Hours'}
                  </h5>
                  <p className="text-sm text-zinc-200 mt-0.5">
                    {t.storeWorkingHours}
                  </p>
                </div>
              </div>

              {/* Interactive Contact Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dark-800">
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-900 border border-dark-700 text-white font-bold text-xs hover:border-neon hover:text-neon transition-colors"
                >
                  <Phone className="w-4 h-4 text-neon" />
                  <span>{t.callNow}</span>
                </a>
                <a
                  href={`https://wa.me/963${whatsapp.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-900 border border-dark-700 text-emerald-400 font-bold text-xs hover:border-emerald-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.whatsapp}</span>
                </a>
                <a
                  href={`https://instagram.com/${instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-900 border border-dark-700 text-zinc-300 font-bold text-xs hover:border-pink-500 hover:text-pink-400 transition-colors col-span-2"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>{instagram}</span>
                </a>
              </div>
            </div>

            {/* Primary Get Directions CTA */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] transition-all"
            >
              <Navigation className="w-5 h-5 fill-current" />
              <span>{t.getDirections}</span>
              <ExternalLink className="w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0 opacity-70" />
            </a>
          </div>

          {/* Right Map Visual Box */}
          <div className="lg:col-span-7 bg-dark-950 rounded-2xl border border-dark-700 overflow-hidden relative min-h-[360px] flex flex-col justify-between p-6 sm:p-8 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] gap-6">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-dark-900 border border-dark-700 text-xs font-bold text-white">
                  <MapPin className="w-3.5 h-3.5 text-neon" />
                  <span>Damascus – Jaramana – Al-Karama Square</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  {isRtl ? 'الموقع على الخريطة' : 'Interactive Map Location'}
                </h3>
                <p className="text-sm text-zinc-400 max-w-lg">
                  {isRtl
                    ? 'اضغط على زر الاتجاهات لفتح الموقع مباشرة عبر تطبيق خرائط جوجل والحصول على الملاحة خطوة بخطوة.'
                    : 'Click the button to launch Google Maps and get turn-by-turn navigation directly to our store entrance.'}
                </p>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-dark-900 border border-neon/50 text-neon font-bold text-sm hover:bg-neon hover:text-dark-950 transition-all shadow-lg shrink-0"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.openInGoogleMaps}</span>
              </a>
            </div>

            <div className="relative z-10 w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-dark-700 bg-dark-900">
              <iframe
                title="SUPPLEMENTS STORE Google Maps Location"
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

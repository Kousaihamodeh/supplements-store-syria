'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Dumbbell, MessageCircle, ShieldCheck, Award, Zap } from 'lucide-react';

export default function WholesalePage() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs">
          <Dumbbell className="w-4 h-4" />
          <span>{isRtl ? 'أسعار خاصة للجملة والمدربين' : 'Wholesale & Personal Trainers'}</span>
        </div>
        <h1 className="text-3xl font-black text-white sm:text-5xl">
          {isRtl ? 'أسعار خاصة للجملة والمدربين' : 'Special Prices for Wholesale & Trainers'}
        </h1>
        <p className="text-base sm:text-lg text-zinc-300">
          {isRtl
            ? 'هل تملك صالة رياضية؟ أو تعمل كمدرب شخصي؟ نوفر لك أفضل المكملات الغذائية العالمية الأصلية 100% بأسعار جملة تنافسية للغاية مع خدمة شحن مباشرة.'
            : 'Own a gym or work as a personal trainer? We supply 100% authentic international sports supplements at highly competitive wholesale rates with direct shipping.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3 text-center">
          <Award className="w-10 h-10 text-neon m-auto" />
          <h3 className="text-lg font-bold text-white">
            {isRtl ? 'ضمان الأصالة 100%' : '100% Authenticity Guarantee'}
          </h3>
          <p className="text-xs text-zinc-400">
            {isRtl
              ? 'جميع المنتجات مستوردة ومفحوصة لضمان أعلى مستويات الجودة لعملائك ومتدربيك.'
              : 'All products are imported and verified to guarantee top quality for your clients and athletes.'}
          </p>
        </div>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3 text-center">
          <Zap className="w-10 h-10 text-neon m-auto" />
          <h3 className="text-lg font-bold text-white">
            {isRtl ? 'خصومات كميات حصرية' : 'Exclusive Bulk Discounts'}
          </h3>
          <p className="text-xs text-zinc-400">
            {isRtl
              ? 'أسعار خاصة تبدأ من الطلبيات المتوسطة، مما يمنحك هامش ربح ممتاز.'
              : 'Special pricing starting from medium orders, giving you an excellent profit margin.'}
          </p>
        </div>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3 text-center">
          <ShieldCheck className="w-10 h-10 text-neon m-auto" />
          <h3 className="text-lg font-bold text-white">
            {isRtl ? 'توصيل لكافة المحافظات' : 'Delivery Across All Governorates'}
          </h3>
          <p className="text-xs text-zinc-400">
            {isRtl
              ? 'شحن آمن وسريع لجميع المحافظات في سوريا.'
              : 'Fast, secure shipping to all Syrian governorates.'}
          </p>
        </div>
      </div>

      <div className="p-8 bg-dark-900 rounded-3xl border border-neon/40 text-center max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {isRtl
            ? 'تواصل معنا الآن للحصول على قائمة أسعار الجملة'
            : 'Contact Us Now for the Wholesale Price List'}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/963938229497?text=أهلاً، أنا مدرب/صاحب نادي أريد الاستفسار عن أسعار الجملة"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-extrabold text-base flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>
              {isRtl ? 'تواصل عبر الواتساب (0938229497)' : 'Chat on WhatsApp (0938229497)'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

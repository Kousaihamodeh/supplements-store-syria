'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { HeroSection } from '@/components/store/HeroSection';
import { StoreMapSection } from '@/components/store/StoreMapSection';
import { ProductCard } from '@/components/store/ProductCard';
import { WholesaleBanner } from '@/components/store/WholesaleBanner';
import { SupplementCalculator } from '@/components/store/SupplementCalculator';
import { ArrowLeft, ArrowRight, Flame, Sparkles, Layers, Search } from 'lucide-react';

interface HomeClientContentProps {
  settings: any;
  categories: any[];
  featuredProducts: any[];
  bestSellers: any[];
  totalProductsCount?: number;
}

export function HomeClientContent({
  settings,
  categories,
  featuredProducts,
  bestSellers,
  totalProductsCount = 69,
}: HomeClientContentProps) {
  const { locale, t } = useLanguage();
  const isRtl = locale === 'ar';

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* 1. Hero Section */}
      <HeroSection settings={settings || undefined} />

      {/* 1.5 Quick Search Bar on Homepage */}
      <section className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 -mt-4 sm:-mt-8 relative z-20">
        <form
          action="/shop"
          method="GET"
          className="flex items-center gap-2 bg-dark-900/95 backdrop-blur-md p-2 rounded-2xl border border-dark-700 focus-within:border-neon shadow-xl transition-all"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neon absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="search"
              placeholder={
                isRtl
                  ? 'ابحث بسرعة عن أي منتج (مثال: Creatine, Whey, ISO)...'
                  : 'Quick search for any product (e.g. Creatine, Whey, ISO)...'
              }
              className="w-full bg-transparent py-2.5 sm:py-3 ltr:pl-10 ltr:pr-3 rtl:pr-10 rtl:pl-3 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-xs sm:text-sm hover:bg-neon-bright transition-colors shrink-0"
          >
            {isRtl ? 'بحث' : 'Search'}
          </button>
        </form>
      </section>

      {/* 2. Categories Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-dark-800 pb-4">
          <div>
            <span className="text-neon text-xs font-bold uppercase tracking-wider block">
              SUPPLEMENT CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isRtl ? 'أقسام المكملات الغذائية' : 'Supplement Categories'}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold text-neon hover:underline flex items-center gap-1"
          >
            <span>{isRtl ? 'جميع الأقسام' : 'All Categories'}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group bg-dark-900 rounded-xl p-4 border border-dark-700 hover:border-neon transition-all text-center flex flex-col items-center space-y-3 hover:-translate-y-1 shadow-md"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-dark-950 border border-dark-700 group-hover:border-neon transition-colors">
                {cat.image ? (
                  <Image src={cat.image} alt={isRtl ? cat.nameAr : cat.nameEn} fill className="object-cover" />
                ) : (
                  <Layers className="w-8 h-8 text-neon m-auto translate-y-4" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-neon transition-colors">
                  {isRtl ? cat.nameAr : cat.nameEn}
                </h3>
                {isRtl && (
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    {cat.nameEn}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2.5 Smart Protein & Creatine Calculator */}
      <SupplementCalculator />

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-dark-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-neon" />
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {t.featuredProducts}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-neon hover:underline flex items-center gap-1"
          >
            <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* Big Browse All Products CTA Button */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-dark-900 border-2 border-neon/60 text-neon font-extrabold text-sm sm:text-base hover:bg-neon hover:text-dark-950 hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] transition-all"
          >
            <span>
              {isRtl
                ? `تصفح جميع المنتجات (${totalProductsCount} منتج)`
                : `Browse All Products (${totalProductsCount} Products)`}
            </span>
            {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section>

      {/* 4. Wholesale & Trainers Banner */}
      <WholesaleBanner />

      {/* 5. Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-dark-800 pb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-current" />
              <h2 className="text-xl sm:text-3xl font-black text-white">
                {t.bestSellers}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Google Maps / Store Location Section */}
      <StoreMapSection settings={settings || undefined} />
    </div>
  );
}

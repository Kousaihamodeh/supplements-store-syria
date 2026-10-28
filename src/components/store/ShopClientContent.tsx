'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ProductCard } from '@/components/store/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ShopClientContentProps {
  categories: any[];
  brands: any[];
  products: any[];
  search?: string;
  category?: string;
  brand?: string;
  sort: string;
}

export function ShopClientContent({
  categories,
  brands,
  products,
  search,
  category,
  brand,
  sort,
}: ShopClientContentProps) {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isRtl ? 'المتجر' : 'Shop Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {isRtl
              ? `تصفح أحدث المكملات الغذائية الرياضية العالمية الأصلية (${products.length} منتج)`
              : `Browse 100% authentic international sports nutrition supplements (${products.length} products)`}
          </p>
        </div>

        {/* Search Bar */}
        <form action="/shop" method="GET" className="relative w-full md:w-80">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder={isRtl ? 'ابحث عن منتج...' : 'Search products...'}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl py-2.5 px-4 ltr:pr-10 rtl:pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
          />
          <button type="submit" className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Content: Products on the Right, Filters Sidebar on the Left (Even on Mobile) */}
      <div className="flex flex-row ltr:flex-row-reverse items-start gap-2.5 sm:gap-6 lg:gap-8">
        
        {/* Product Grid Area (Right Side) */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-6">
          
          {/* Active Filter Tags & Sort Control */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-dark-900/50 p-2.5 sm:p-4 rounded-xl border border-dark-800 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">{isRtl ? 'عرض:' : 'Showing:'}</span>
              <span className="font-bold text-white">
                {products.length} {isRtl ? 'منتج' : 'products'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-400 hidden sm:inline">{isRtl ? 'ترتيب:' : 'Sort:'}</span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/shop?sort=newest${category ? `&category=${category}` : ''}`}
                  className={`px-2 sm:px-3 py-1 rounded-md border font-semibold ${
                    sort === 'newest'
                      ? 'bg-neon text-dark-950 border-neon'
                      : 'bg-dark-900 text-zinc-300 border-dark-700'
                  }`}
                >
                  {isRtl ? 'الأحدث' : 'Newest'}
                </Link>
                <Link
                  href={`/shop?sort=price-low${category ? `&category=${category}` : ''}`}
                  className={`px-2 sm:px-3 py-1 rounded-md border font-semibold ${
                    sort === 'price-low'
                      ? 'bg-neon text-dark-950 border-neon'
                      : 'bg-dark-900 text-zinc-300 border-dark-700'
                  }`}
                >
                  {isRtl ? 'الأقل سعراً' : 'Price: Low'}
                </Link>
                <Link
                  href={`/shop?sort=price-high${category ? `&category=${category}` : ''}`}
                  className={`px-2 sm:px-3 py-1 rounded-md border font-semibold ${
                    sort === 'price-high'
                      ? 'bg-neon text-dark-950 border-neon'
                      : 'bg-dark-900 text-zinc-300 border-dark-700'
                  }`}
                >
                  {isRtl ? 'الأعلى سعراً' : 'Price: High'}
                </Link>
              </div>
            </div>
          </div>

          {/* Product Cards */}
          {products.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-dark-900 rounded-2xl border border-dark-800 space-y-3">
              <p className="text-sm sm:text-base text-zinc-400">
                {isRtl ? 'لم يتم العثور على منتجات تطابق البحث' : 'No products matched your search criteria'}
              </p>
              <Link href="/shop" className="inline-block px-4 py-2 rounded-lg bg-neon text-dark-950 font-bold text-xs">
                {isRtl ? 'إعادة ضبط الفلترة' : 'Reset Filters'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

        {/* Sidebar Filters (Left Side) */}
        <aside className="w-[110px] sm:w-52 lg:w-64 shrink-0 sticky top-20 bg-dark-900 p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-dark-800 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-neon font-bold text-xs sm:text-base border-b border-dark-800 pb-2 sm:pb-3">
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
            <span className="leading-tight">{isRtl ? 'التصفية والفلترة' : 'Filters'}</span>
          </div>

          {/* Categories Filter */}
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">
              {isRtl ? 'الأقسام' : 'Categories'}
            </h4>
            <div className="space-y-1 text-[11px] sm:text-sm">
              <Link
                href="/shop"
                className={`block py-1.5 px-2 sm:px-3 rounded-lg font-medium transition-colors leading-snug ${
                  !category ? 'bg-neon text-dark-950 font-bold' : 'text-zinc-300 hover:text-neon'
                }`}
              >
                {isRtl ? 'جميع الأقسام' : 'All Categories'}
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}${search ? `&search=${search}` : ''}`}
                  className={`block py-1.5 px-2 sm:px-3 rounded-lg transition-colors leading-snug ${
                    category === cat.slug
                      ? 'bg-neon text-dark-950 font-bold'
                      : 'text-zinc-300 hover:text-neon'
                  }`}
                >
                  {isRtl ? cat.nameAr : cat.nameEn}
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

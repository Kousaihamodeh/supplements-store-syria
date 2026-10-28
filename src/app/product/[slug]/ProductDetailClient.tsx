'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ProductGallery } from '@/components/store/ProductGallery';
import { ProductCard } from '@/components/store/ProductCard';
import ProductClientActions from './ProductClientActions';
import { ShieldCheck, Truck } from 'lucide-react';

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: any;
  relatedProducts: any[];
}) {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  const title = isRtl ? product.nameAr : product.nameEn;
  const secondaryTitle = isRtl ? product.nameEn : '';
  const description = isRtl
    ? product.descriptionAr || product.descriptionEn
    : product.descriptionEn || product.descriptionAr;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images} title={title} />
        </div>

        {/* Right Column: Product Details & Client Variant Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-dark-800 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
            {secondaryTitle && (
              <h2 className="text-sm font-semibold text-zinc-400">{secondaryTitle}</h2>
            )}
          </div>

          {/* Client Interactive Component for Size/Flavor selection & Add to Cart */}
          <ProductClientActions product={product} />

          {/* Guarantee Badges */}
          <div className="p-4 rounded-xl bg-dark-900 border border-dark-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neon shrink-0" />
              <span>
                {isRtl ? 'مكملات أصلية 100% مضمونة' : '100% Authentic Supplements Guaranteed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-neon shrink-0" />
              <span>
                {isRtl
                  ? 'توصيل لكافة المحافظات السورية'
                  : 'Fast Delivery Across All Syrian Governorates'}
              </span>
            </div>
          </div>

          {/* Description Section */}
          {description && (
            <div className="space-y-3 pt-4 border-t border-dark-800">
              <h3 className="text-base font-extrabold text-white">
                {isRtl ? 'تفاصيل المنتج' : 'Product Description'}
              </h3>
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-dark-900/60 p-4 rounded-xl border border-dark-800">
                {description}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-dark-800">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {isRtl ? 'منتجات ذات صلة' : 'Related Products'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

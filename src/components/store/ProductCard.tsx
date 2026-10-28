'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Eye, Tag, Flame, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    category?: { nameAr: string; nameEn: string };
    brand?: { nameAr: string; nameEn: string } | null;
    images: { url: string; isMain?: boolean }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale, t } = useLanguage();
  const { addToCart } = useCart();
  const isRtl = locale === 'ar';

  const title = isRtl ? product.nameAr : product.nameEn;
  const brandName = product.brand ? (isRtl ? product.brand.nameAr : product.brand.nameEn) : null;
  const mainImage = product.images.find((img) => img.isMain)?.url || product.images[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart({
      id: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: mainImage,
      stock: product.stock,
    });
  };

  return (
    <div className="group relative bg-dark-900 rounded-xl sm:rounded-2xl border border-dark-700 hover:border-neon/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(132,204,22,0.15)] min-w-0">
      
      {/* Badges Container */}
      <div className="absolute top-2 ltr:left-2 rtl:right-2 sm:top-3 sm:ltr:left-3 sm:rtl:right-3 z-10 flex flex-col gap-1 sm:gap-1.5">
        {product.isOnSale && product.oldPrice && (
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-rose-600 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {t.discount}
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-500 text-dark-950 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            {t.bestSellers}
          </span>
        )}
        {product.isNew && (
          <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-neon text-dark-950 font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            {t.newArrivals}
          </span>
        )}
      </div>

      {/* Image & Quick View Link */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-dark-950 overflow-hidden">
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-2 text-center">
            <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-dark-800 text-rose-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider border border-rose-500/30">
              {t.outOfStock}
            </span>
          </div>
        )}
      </Link>

      {/* Card Details Body */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4 min-w-0">
        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-xs sm:text-base text-white hover:text-neon transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-dark-800 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="text-xs sm:text-lg font-black text-white leading-tight truncate">
              {formatPrice(product.price, locale)}
            </div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-zinc-500 line-through truncate">
                {formatPrice(product.oldPrice, locale)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center shrink-0 ${
              product.stock > 0
                ? 'bg-neon text-dark-950 hover:bg-neon-bright shadow-md transform active:scale-95'
                : 'bg-dark-800 text-zinc-600 cursor-not-allowed'
            }`}
            title={product.stock > 0 ? t.addToCart : t.outOfStock}
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5 font-bold" />
          </button>
        </div>
      </div>

    </div>
  );
}

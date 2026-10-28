'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface ProductClientActionsProps {
  product: {
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    oldPrice?: number | null;
    stock: number;
    images: { url: string; isMain?: boolean }[];
    variants: { id: string; size?: string | null; flavor?: string | null; priceAdjustment: number; stock: number }[];
  };
}

export default function ProductClientActions({ product }: ProductClientActionsProps) {
  const { locale, t } = useLanguage();
  const { addToCart } = useCart();
  const router = useRouter();

  // Extract unique sizes and flavors from variants
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  const flavors = Array.from(new Set(product.variants.map((v) => v.flavor).filter(Boolean))) as string[];

  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(flavors[0]);
  const [quantity, setQuantity] = useState(1);

  // Calculate current variant price adjustment
  const activeVariant = product.variants.find(
    (v) => (sizes.length === 0 || v.size === selectedSize) && (flavors.length === 0 || v.flavor === selectedFlavor)
  );

  const currentPrice = product.price + (activeVariant?.priceAdjustment || 0);
  const mainImage = product.images.find((i) => i.isMain)?.url || product.images[0]?.url || '';

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: currentPrice,
        image: mainImage,
        size: selectedSize,
        flavor: selectedFlavor,
        stock: activeVariant?.stock || product.stock,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      
      {/* Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-neon">
          {formatPrice(currentPrice, locale)}
        </span>
        {product.oldPrice && product.oldPrice > currentPrice && (
          <span className="text-sm text-zinc-500 line-through">
            {formatPrice(product.oldPrice, locale)}
          </span>
        )}
      </div>

      {/* Size Variants */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
            {t.selectSize}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedSize === sz
                    ? 'bg-neon text-dark-950 border-neon shadow-md'
                    : 'bg-dark-900 text-zinc-300 border-dark-700 hover:border-zinc-500'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flavor Variants */}
      {flavors.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
            {t.selectFlavor}
          </label>
          <div className="flex flex-wrap gap-2">
            {flavors.map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFlavor(fl)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  selectedFlavor === fl
                    ? 'bg-neon text-dark-950 border-neon shadow-md'
                    : 'bg-dark-900 text-zinc-300 border-dark-700 hover:border-zinc-500'
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-dark-800">
        
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between bg-dark-900 border border-dark-700 rounded-xl p-2 sm:w-36">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-lg bg-dark-950 text-white font-bold hover:bg-dark-800"
          >
            -
          </button>
          <span className="font-extrabold text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-lg bg-dark-950 text-white font-bold hover:bg-dark-800"
          >
            +
          </button>
        </div>

        {/* Buttons */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="py-3.5 px-4 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.addToCart}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="py-3.5 px-4 rounded-xl bg-dark-900 border border-dark-700 text-white font-bold text-sm hover:border-neon hover:text-neon transition-all flex items-center justify-center gap-2"
          >
            <span>{locale === 'ar' ? 'إتمام الطلب مباشرة' : 'Buy Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

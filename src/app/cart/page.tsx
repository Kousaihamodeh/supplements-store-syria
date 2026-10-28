'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { locale, t } = useLanguage();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const isRtl = locale === 'ar';

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center m-auto text-zinc-600">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-white">{t.emptyCart}</h1>
        <p className="text-sm text-zinc-400">تصفح منتجاتنا الممتازة وأضف ما يناسبك إلى السلة</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright transition-all"
        >
          <span>{t.shopNow}</span>
          {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-800 pb-4">
        <h1 className="text-3xl font-black text-white">{t.cart} ({cartItems.length})</h1>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:underline font-bold"
        >
          تفريغ السلة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const title = isRtl ? item.nameAr : item.nameEn;
            return (
              <div
                key={item.cartItemId}
                className="p-4 sm:p-5 rounded-2xl bg-dark-900 border border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-dark-950 border border-dark-700 shrink-0">
                    <Image src={item.image} alt={title} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">{title}</h3>
                    {(item.size || item.flavor) && (
                      <div className="text-xs text-zinc-400 flex gap-2 mt-1">
                        {item.size && <span className="bg-dark-950 px-2 py-0.5 rounded border border-dark-700">{item.size}</span>}
                        {item.flavor && <span className="bg-dark-950 px-2 py-0.5 rounded border border-dark-700">{item.flavor}</span>}
                      </div>
                    )}
                    <div className="text-sm font-black text-neon mt-2">
                      {formatPrice(item.price, locale)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-dark-800 pt-3 sm:pt-0">
                  <div className="flex items-center gap-2 bg-dark-950 border border-dark-700 rounded-xl p-1.5">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-dark-900 text-zinc-400 hover:text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-dark-900 text-zinc-400 hover:text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-6">
          <h2 className="text-lg font-black text-white border-b border-dark-800 pb-3">ملخص الطلب</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-zinc-300">
              <span>{t.cartSubtotal}</span>
              <span className="font-extrabold text-white">{formatPrice(cartTotal, locale)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>أجور الشحن</span>
              <span className="text-xs text-zinc-400">تحدد في صفحة الشراء</span>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800 flex items-center justify-between text-lg font-black">
            <span>{t.cartTotal}</span>
            <span className="text-neon text-2xl">{formatPrice(cartTotal, locale)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{t.checkout}</span>
            {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>

      </div>
    </div>
  );
}

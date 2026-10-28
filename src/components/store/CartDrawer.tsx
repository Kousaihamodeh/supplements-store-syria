'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export function CartDrawer() {
  const { locale, t } = useLanguage();
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const isRtl = locale === 'ar';

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 ltr:right-0 rtl:left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-dark-950 border-l border-dark-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neon" />
              <h3 className="text-lg font-bold">{t.cart}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-900 border border-dark-700 text-neon font-bold">
                {cartItems.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg bg-dark-900 text-zinc-400 hover:text-white border border-dark-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-500">
                <ShoppingBag className="w-16 h-16 stroke-1 text-dark-700" />
                <p className="text-base font-semibold">{t.emptyCart}</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-neon text-dark-950 font-bold text-sm"
                >
                  {t.shopNow}
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const title = isRtl ? item.nameAr : item.nameEn;
                return (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-xl bg-dark-900 border border-dark-800 flex gap-3 items-center justify-between"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-950 border border-dark-700 shrink-0">
                      <Image src={item.image} alt={title} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-white line-clamp-1 break-words">{title}</h4>
                      {(item.size || item.flavor) && (
                        <div className="text-[11px] text-zinc-400 flex flex-wrap gap-1">
                          {item.size && <span className="bg-dark-950 px-1.5 py-0.5 rounded border border-dark-700">{item.size}</span>}
                          {item.flavor && <span className="bg-dark-950 px-1.5 py-0.5 rounded border border-dark-700">{item.flavor}</span>}
                        </div>
                      )}
                      <div className="text-sm font-extrabold text-neon">
                        {formatPrice(item.price, locale)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-dark-950 border border-dark-700 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-dark-800 bg-dark-900/50 space-y-4">
              <div className="flex items-center justify-between text-base font-bold">
                <span className="text-zinc-300">{t.cartSubtotal}</span>
                <span className="text-neon text-xl font-black">{formatPrice(cartTotal, locale)}</span>
              </div>
              <p className="text-xs text-zinc-400">
                {isRtl ? 'يتم حساب أجور الشحن عند الخطوة التالية حسب المحافظة' : 'Shipping fees calculated at checkout based on governorate'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-4 rounded-xl bg-dark-900 border border-dark-700 text-center font-bold text-sm text-zinc-200 hover:border-neon transition-colors"
                >
                  {t.viewCart}
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-4 rounded-xl bg-neon text-dark-950 text-center font-extrabold text-sm hover:bg-neon-bright transition-all flex items-center justify-center gap-1"
                >
                  <span>{t.checkout}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

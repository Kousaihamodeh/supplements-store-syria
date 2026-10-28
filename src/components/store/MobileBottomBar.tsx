'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { Home, ShoppingBag, Store, Truck, MessageCircle } from 'lucide-react';

export function MobileBottomBar() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const isRtl = locale === 'ar';

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-dark-950/95 backdrop-blur-md border-t border-dark-800 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-5 items-center text-center">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-xl transition-colors ${
            pathname === '/' ? 'text-neon font-extrabold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-tight">{isRtl ? 'الرئيسية' : 'Home'}</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-xl transition-colors ${
            pathname?.startsWith('/shop') ? 'text-neon font-extrabold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] leading-tight">{isRtl ? 'المتجر' : 'Shop'}</span>
        </Link>

        {/* 3. Cart (Center Highlight) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 gap-0.5 text-white"
        >
          <div className="relative w-10 h-10 -mt-4 rounded-full bg-neon text-dark-950 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.5)] border-2 border-dark-950">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-neon leading-tight">
            {isRtl ? 'السلة' : 'Cart'}
          </span>
        </button>

        {/* 4. Shipping */}
        <Link
          href="/shipping-order"
          className={`flex flex-col items-center justify-center py-1 gap-0.5 rounded-xl transition-colors ${
            pathname?.startsWith('/shipping-order')
              ? 'text-neon font-extrabold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] leading-tight">{isRtl ? 'الشحن' : 'Delivery'}</span>
        </Link>

        {/* 5. WhatsApp */}
        <a
          href="https://wa.me/963938229497"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 gap-0.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="text-[10px] leading-tight">{isRtl ? 'واتساب' : 'WhatsApp'}</span>
        </a>
      </div>
    </nav>
  );
}

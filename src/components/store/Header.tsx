'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import {
  ShoppingBag,
  Search,
  Globe,
  Menu,
  X,
  Phone,
  MessageCircle,
  MapPin,
  Dumbbell,
  Truck,
} from 'lucide-react';

export function Header() {
  const { locale, t, toggleLanguage } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-md border-b border-dark-800 text-white">
      {/* Top Banner Info */}
      <div className="bg-dark-900 border-b border-dark-800/60 py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2 text-zinc-400">
          <div className="flex items-center space-x-2 rtl:space-x-reverse truncate">
            <span className="flex items-center text-neon truncate">
              <Dumbbell className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 animate-pulse shrink-0" />
              <span className="truncate">{t.heroBadge}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse shrink-0">
            <a
              href="tel:0938229497"
              className="hover:text-neon transition-colors flex items-center dir-ltr"
            >
              <Phone className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              0938229497
            </a>
            <a
              href="https://wa.me/963938229497"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon transition-colors flex items-center text-emerald-400"
            >
              <MessageCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              {t.whatsapp}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-dark-900 border border-dark-700 group-hover:border-neon transition-colors shadow-md shrink-0">
            <Image
              src="/images/logo.jpg"
              alt="SUPPLEMENTS STORE"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-lg font-extrabold tracking-wider text-white group-hover:text-neon transition-colors truncate">
              SUPPLEMENTS <span className="text-neon">STORE</span>
            </span>
            <span className="text-[10px] text-zinc-400 tracking-wide truncate">
              {t.storeSubtitle}
            </span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-dark-900/90 border border-dark-700 rounded-full py-2 px-4 ltr:pr-10 rtl:pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
          />
          <button
            type="submit"
            className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-neon"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Desktop Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-neon transition-all"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-neon" />
            <span>{t.languageSwitcher}</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2.5 rounded-lg bg-dark-900 border border-dark-700 text-white hover:border-neon transition-all"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 text-neon" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-neon text-dark-950 font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-dark-900 border border-dark-700 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Links Bar */}
      <nav className="hidden md:block bg-dark-900/60 border-t border-dark-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-8 rtl:space-x-reverse text-sm font-medium py-2">
          <Link href="/" className="hover:text-neon transition-colors">
            {t.navHome}
          </Link>
          <Link href="/shop" className="hover:text-neon transition-colors">
            {t.navShop}
          </Link>
          <Link href="/shop?category=whey-protein" className="hover:text-neon transition-colors">
            {t.navCategories}
          </Link>
          <Link href="/shop?onSale=true" className="text-neon font-bold hover:underline">
            {t.navOffers}
          </Link>
          <Link href="/shipping-order" className="hover:text-neon transition-colors text-emerald-400 font-bold flex items-center gap-1">
            <Truck className="w-4 h-4" />
            <span>{t.navShipping}</span>
          </Link>
          <Link href="/wholesale" className="hover:text-neon transition-colors text-zinc-300">
            {t.navWholesale}
          </Link>
          <Link href="/contact" className="hover:text-neon transition-colors">
            {t.navContact}
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-950 border-b border-dark-800 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg py-2 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-neon"
            />
            <button
              type="submit"
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-3 pt-2 text-base font-semibold border-t border-dark-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon transition-colors py-1"
            >
              {t.navHome}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon transition-colors py-1"
            >
              {t.navShop}
            </Link>
            <Link
              href="/shop?onSale=true"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neon py-1"
            >
              {t.navOffers}
            </Link>
            <Link
              href="/shipping-order"
              onClick={() => setMobileMenuOpen(false)}
              className="text-emerald-400 font-bold flex items-center gap-1.5 py-1"
            >
              <Truck className="w-4 h-4" />
              <span>{t.navShipping}</span>
            </Link>
            <Link
              href="/wholesale"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon transition-colors py-1"
            >
              {t.navWholesale}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-neon transition-colors py-1"
            >
              {t.navContact}
            </Link>
          </div>

          <div className="pt-3 border-t border-dark-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Damascus - Jaramana</span>
            <a
              href="https://wa.me/963938229497"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 flex items-center gap-1 font-bold"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

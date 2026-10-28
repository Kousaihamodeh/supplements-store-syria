'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Phone, MessageCircle, MapPin, Instagram, Globe, ShieldCheck, Truck, Clock } from 'lucide-react';

export function Footer() {
  const { locale, t, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-dark-950 text-white border-t border-dark-800 pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-dark-800/60">
        
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-dark-700">
              <Image src="/images/logo.jpg" alt="SUPPLEMENTS STORE" fill className="object-cover" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-wider">
              SUPPLEMENTS <span className="text-neon">STORE</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.footerDesc}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://instagram.com/supplement_store_syria"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center text-zinc-300 hover:text-neon hover:border-neon transition-colors"
              title="Instagram @supplement_store_syria"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/963938229497"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center text-emerald-400 hover:border-emerald-500 transition-colors"
              title="WhatsApp 0938229497"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="tel:0938229497"
              className="w-9 h-9 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center text-zinc-300 hover:text-neon hover:border-neon transition-colors"
              title="Call 0938229497"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-base font-bold text-white uppercase tracking-wider text-neon">
            {t.quickLinks}
          </h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/" className="hover:text-neon transition-colors">
                {t.navHome}
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-neon transition-colors">
                {t.navShop}
              </Link>
            </li>
            <li>
              <Link href="/shop?onSale=true" className="hover:text-neon transition-colors">
                {t.navOffers}
              </Link>
            </li>
            <li>
              <Link href="/wholesale" className="hover:text-neon transition-colors">
                {t.navWholesale}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-neon transition-colors">
                {t.navContact}
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-base font-bold text-white uppercase tracking-wider text-neon">
            {t.categories}
          </h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/shop?category=whey-protein" className="hover:text-neon transition-colors">
                {locale === 'ar' ? 'واي بروتين' : 'Whey Protein'}
              </Link>
            </li>
            <li>
              <Link href="/shop?category=creatine" className="hover:text-neon transition-colors">
                {locale === 'ar' ? 'كرياتين' : 'Creatine'}
              </Link>
            </li>
            <li>
              <Link href="/shop?category=mass-gainer" className="hover:text-neon transition-colors">
                {locale === 'ar' ? 'ماس جينر' : 'Mass Gainer'}
              </Link>
            </li>
            <li>
              <Link href="/shop?category=pre-workout" className="hover:text-neon transition-colors">
                {locale === 'ar' ? 'قبل التمرين' : 'Pre-Workout'}
              </Link>
            </li>
            <li>
              <Link href="/shop?category=amino-acids" className="hover:text-neon transition-colors">
                {locale === 'ar' ? 'أحماض أمينية BCAA' : 'Amino Acids (BCAA)'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Location Info */}
        <div className="space-y-3">
          <h4 className="text-base font-bold text-white uppercase tracking-wider text-neon">
            {t.contactInfo}
          </h4>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-neon shrink-0 mt-0.5" />
              <a
                href="https://maps.google.com/?q=33.488506,36.340218"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neon transition-colors"
              >
                {t.storeAddressValue}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-neon shrink-0" />
              <a href="tel:0938229497" className="hover:text-white transition-colors dir-ltr">
                0938229497
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Instagram className="w-4 h-4 text-neon shrink-0" />
              <a
                href="https://instagram.com/supplement_store_syria"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                @supplement_store_syria
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-xs text-zinc-500">
              <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{t.storeWorkingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright & Language Switcher Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>{t.rightsReserved}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-neon" />
            <span>{t.languageSwitcher}</span>
          </button>
          <span>|</span>
          <Link href="/admin/login" className="hover:text-neon transition-colors">
            {t.adminLogin}
          </Link>
        </div>
      </div>
    </footer>
  );
}

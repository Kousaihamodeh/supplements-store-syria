'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingCart,
  Truck,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(pathname !== '/admin/login');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setCheckingAuth(false);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, router]);

  // Skip layout sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white text-sm">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin m-auto"></div>
          <p className="text-zinc-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { label: 'نظرة عامة', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'المنتجات', href: '/admin/products', icon: Package },
    { label: 'الأقسام', href: '/admin/categories', icon: Layers },
    { label: 'الماركات', href: '/admin/brands', icon: Award },
    { label: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
    { label: 'أجور الشحن', href: '/admin/shipping', icon: Truck },
    { label: 'إعدادات المتجر & الخريطة', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-dark-900 border-b md:border-b-0 md:border-l border-dark-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-white">إدارة المتجر</h2>
            <span className="text-[10px] text-neon font-bold">SUPPLEMENTS STORE</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-dark-950 text-zinc-400 hover:text-white border border-dark-700"
            title="معاينة المتجر"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <nav className="flex md:flex-col overflow-x-auto gap-1.5 md:space-y-1 pb-2 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 md:gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-neon text-dark-950 shadow-md'
                    : 'text-zinc-300 hover:bg-dark-950 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-2 md:pt-6 border-t border-dark-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:bg-rose-950/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

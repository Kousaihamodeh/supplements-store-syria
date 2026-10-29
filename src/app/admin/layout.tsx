'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Ticket,
  Bell,
  X,
  Volume2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(pathname !== '/admin/login');
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [latestOrderAlert, setLatestOrderAlert] = useState<any | null>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);
  const prevCountRef = useRef<number>(0);

  // Play audio chime using Web Audio API (no external mp3 file needed)
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      // Audio playback might be restricted by browser policy until user interacts
    }
  };

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

  // Polling for new orders notifications
  useEffect(() => {
    if (pathname === '/admin/login') return;

    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/orders/notifications');
        if (!res.ok) return;
        const data = await res.json();
        const currentCount = data.newOrdersCount || 0;

        // If new orders increased or first detected
        if (currentCount > prevCountRef.current && prevCountRef.current !== 0) {
          playNotificationSound();
        }

        prevCountRef.current = currentCount;
        setNewOrdersCount(currentCount);

        if (data.latestOrders && data.latestOrders.length > 0) {
          const newest = data.latestOrders[0];
          if (newest && newest.id !== dismissedOrderId) {
            setLatestOrderAlert(newest);
          }
        } else {
          setLatestOrderAlert(null);
        }
      } catch (err) {
        // Silently catch network errors during polling
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [pathname, dismissedOrderId]);

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
    { 
      label: 'الطلبات', 
      href: '/admin/orders', 
      icon: ShoppingCart,
      badge: newOrdersCount > 0 ? newOrdersCount : null 
    },
    { label: 'كوبونات الخصم', href: '/admin/coupons', icon: Ticket },
    { label: 'أجور الشحن', href: '/admin/shipping', icon: Truck },
    { label: 'إعدادات المتجر & الخريطة', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col md:flex-row relative">
      
      {/* Real-time Order Popup Banner */}
      {latestOrderAlert && pathname !== '/admin/orders' && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-bounce-short">
          <div className="bg-gradient-to-r from-emerald-950 via-dark-900 to-emerald-950 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl text-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5" />
                  <span>طلب جديد وصل الآن!</span>
                </span>
              </div>
              <button
                onClick={() => {
                  setDismissedOrderId(latestOrderAlert.id);
                  setLatestOrderAlert(null);
                }}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="font-extrabold text-white text-sm">
                {latestOrderAlert.customerName} ({latestOrderAlert.governorate})
              </div>
              <div className="text-zinc-300">
                رقم الطلب: <span className="font-mono text-neon font-bold">{latestOrderAlert.orderNumber}</span>
              </div>
              <div className="text-zinc-300">
                المجموع: <span className="font-bold text-white">{latestOrderAlert.total} $</span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <Link
                href="/admin/orders"
                onClick={() => {
                  setDismissedOrderId(latestOrderAlert.id);
                  setLatestOrderAlert(null);
                }}
                className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs rounded-xl text-center shadow transition-all"
              >
                عرض الطلب فوراً
              </Link>
            </div>
          </div>
        </div>
      )}

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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-neon text-dark-950 shadow-md'
                    : 'text-zinc-300 hover:bg-dark-950 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 md:gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-dark-950 text-neon' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-2 md:pt-6 border-t border-dark-800 space-y-2">
          {newOrdersCount > 0 && (
            <div className="p-2.5 rounded-xl bg-dark-950 border border-emerald-500/30 text-[11px] text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>طلبات جديدة بانتظارك:</span>
              </span>
              <span className="font-extrabold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                {newOrdersCount}
              </span>
            </div>
          )}

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

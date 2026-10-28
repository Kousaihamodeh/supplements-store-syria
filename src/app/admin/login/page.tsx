'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@supplementstore.sy');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-dark-900 p-8 rounded-3xl border border-dark-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-dark-950 border border-dark-700 m-auto">
            <Image src="/images/logo.jpg" alt="Admin" fill className="object-cover" />
          </div>
          <h1 className="text-2xl font-black text-white">لوحة تحكم الإدارة</h1>
          <p className="text-xs text-zinc-400">سجل الدخول لإدارة المنتجات، الطلبات، وخرائط جوجل</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">البريد الإلكتروني / Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 ltr:pl-10 rtl:pr-10 text-white focus:border-neon focus:outline-none"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">كلمة المرور / Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 ltr:pl-10 rtl:pr-10 text-white focus:border-neon focus:outline-none"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright transition-all shadow-lg"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-dark-950 border border-dark-800 text-[11px] text-zinc-400 text-center space-y-1">
          <p className="font-bold text-zinc-300">البيانات الافتراضية للتطوير:</p>
          <p>Email: <code className="text-neon">admin@supplementstore.sy</code></p>
          <p>Password: <code className="text-neon">admin123</code></p>
        </div>
      </div>
    </div>
  );
}

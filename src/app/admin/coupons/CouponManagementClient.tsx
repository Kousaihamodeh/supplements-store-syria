'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Plus, Trash2, Check, X, Percent, DollarSign, Calendar, Hash } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponManagementClient({ initialCoupons }: { initialCoupons: any[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE', // PERCENTAGE or FIXED
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert('يرجى إدخال رمز الكوبون');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim().toUpperCase(),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ');

      if (editingId) {
        setCoupons((prev) => prev.map((c) => (c.id === editingId ? data : c)));
        setEditingId(null);
      } else {
        setCoupons((prev) => [data, ...prev]);
      }

      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxUses: '',
        expiresAt: '',
        isActive: true,
      });

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'فشلت العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('فشل التحديث');
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`هل أنت متأكد من حذف الكوبون "${code}"؟`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Create / Edit Form */}
      <div className="lg:col-span-4 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Ticket className="w-4 h-4 text-neon" />
          <span>{editingId ? 'تعديل كوبون الخصم' : 'إضافة كوبون جديد'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">رمز الكوبون (Coupon Code) *</label>
            <input
              type="text"
              required
              placeholder="مثال: SUMMER10 أو KOUSAI"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-3 text-white uppercase font-mono tracking-wider focus:border-neon focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">نوع الخصم</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
              >
                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت ($)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">قيمة الخصم *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value || '0') })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white font-bold focus:border-neon"
                />
                <span className="absolute left-3 top-2 text-zinc-500 font-bold">
                  {formData.discountType === 'PERCENTAGE' ? '%' : '$'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">الحد الأدنى للطلب ($)</label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value || '0') })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
                placeholder="0 (بدون حد)"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">أقصى عدد استخدامات</label>
              <input
                type="number"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
                placeholder="غير محدود"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">تاريخ انتهاء الصلاحية (اختياري)</label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCoupon"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-neon focus:ring-0 bg-dark-950 border-dark-700"
            />
            <label htmlFor="isActiveCoupon" className="text-zinc-300 font-bold select-none cursor-pointer">
              الكوبون مفعّل وجاهز للاستخدام
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'حفظ التعديلات' : 'إنشاء الكوبون'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    code: '',
                    discountType: 'PERCENTAGE',
                    discountValue: 10,
                    minOrderAmount: 0,
                    maxUses: '',
                    expiresAt: '',
                    isActive: true,
                  });
                }}
                className="px-4 py-3 rounded-xl bg-dark-950 border border-dark-700 text-zinc-300 font-bold"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Coupons List Table */}
      <div className="lg:col-span-8 bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
              <tr>
                <th className="p-4">رمز الكوبون</th>
                <th className="p-4">الخصم</th>
                <th className="p-4">شروط الطلب</th>
                <th className="p-4">الاستخدام</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    لا توجد كوبونات خصم حتى الآن. أنشئ أول كوبون من القائمة الجانبية!
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const isMaxReached = c.maxUses && c.usedCount >= c.maxUses;
                  const isUsable = c.isActive && !isExpired && !isMaxReached;

                  return (
                    <tr key={c.id} className="hover:bg-dark-950/50">
                      <td className="p-4">
                        <div className="font-mono font-black text-white text-sm tracking-wider flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-neon" />
                          <span>{c.code}</span>
                        </div>
                        {c.expiresAt && (
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            ينتهي: {new Date(c.expiresAt).toLocaleDateString('ar-SY')}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-neon text-sm">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `${c.discountValue} $`}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400">
                        {c.minOrderAmount > 0 ? `الحد الأدنى: ${c.minOrderAmount} $` : 'بدون حد أدنى'}
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-white font-bold">{c.usedCount}</span>
                        <span className="text-zinc-500">/{c.maxUses || '∞'}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                            isUsable
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                          title="اضغط للتفعيل أو التعطيل"
                        >
                          {isExpired
                            ? 'منتهي الصلاحية'
                            : isMaxReached
                            ? 'اكتمل الاستخدام'
                            : c.isActive
                            ? 'مفعّل'
                            : 'معطّل'}
                        </button>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setFormData({
                              code: c.code,
                              discountType: c.discountType,
                              discountValue: c.discountValue,
                              minOrderAmount: c.minOrderAmount,
                              maxUses: c.maxUses ? String(c.maxUses) : '',
                              expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
                              isActive: c.isActive,
                            });
                          }}
                          className="p-1.5 rounded bg-dark-950 border border-dark-700 text-zinc-300 hover:text-neon"
                          title="تعديل"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

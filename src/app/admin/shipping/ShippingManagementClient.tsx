'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ShippingManagementClient({ initialAreas }: { initialAreas: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ governorateAr: '', governorateEn: '', shippingFee: 20000 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.governorateAr || !formData.governorateEn) return;

    try {
      const url = editingId ? `/api/shipping/${editingId}` : '/api/shipping';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('فشل الحفظ');

      setFormData({ governorateAr: '', governorateEn: '', shippingFee: 20000 });
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف محافظة "${name}"؟`)) return;
    await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-base text-white">
          {editingId ? 'تعديل محافظة' : 'إضافة محافظة جديدة'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">المحافظة بالعربية *</label>
            <input
              type="text"
              required
              value={formData.governorateAr}
              onChange={(e) => setFormData({ ...formData, governorateAr: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">Governorate English *</label>
            <input
              type="text"
              required
              value={formData.governorateEn}
              onChange={(e) => setFormData({ ...formData, governorateEn: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon dir-ltr"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">أجور الشحن ($) *</label>
            <input
              type="number"
              required
              value={formData.shippingFee}
              onChange={(e) => setFormData({ ...formData, shippingFee: parseFloat(e.target.value || '0') })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all"
          >
            {editingId ? 'حفظ التعديل' : 'إضافة المحافظة'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
              <tr>
                <th className="p-4">المحافظة</th>
                <th className="p-4">English Name</th>
                <th className="p-4">أجور الشحن</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {initialAreas.map((area) => (
                <tr key={area.id} className="hover:bg-dark-950/50">
                  <td className="p-4 font-bold text-white">{area.governorateAr}</td>
                  <td className="p-4 font-mono">{area.governorateEn}</td>
                  <td className="p-4 font-extrabold text-neon">{area.shippingFee.toLocaleString()} $</td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(area.id);
                        setFormData({
                          governorateAr: area.governorateAr,
                          governorateEn: area.governorateEn,
                          shippingFee: area.shippingFee,
                        });
                      }}
                      className="p-1.5 rounded bg-dark-950 text-zinc-300 hover:text-neon"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(area.id, area.governorateAr)}
                      className="p-1.5 rounded bg-rose-950 text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

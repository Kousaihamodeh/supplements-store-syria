'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function BrandManagementClient({ initialBrands }: { initialBrands: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ nameAr: '', nameEn: '', logo: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) return;

    try {
      const url = editingId ? `/api/brands/${editingId}` : '/api/brands';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('فشل التعديل');

      setFormData({ nameAr: '', nameEn: '', logo: '' });
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف الماركة "${name}"؟`)) return;
    await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-base text-white">
          {editingId ? 'تعديل ماركة' : 'إضافة ماركة جديدة'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">الاسم بالعربية *</label>
            <input
              type="text"
              required
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">English Name *</label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon dir-ltr"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">رابط الشعار (Logo URL)</label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon dir-ltr"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all"
          >
            {editingId ? 'حفظ' : 'إضافة الماركة'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-8 bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
              <tr>
                <th className="p-4">الاسم بالعربية</th>
                <th className="p-4">English Name</th>
                <th className="p-4">عدد المنتجات</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {initialBrands.map((b) => (
                <tr key={b.id} className="hover:bg-dark-950/50">
                  <td className="p-4 font-bold text-white">{b.nameAr}</td>
                  <td className="p-4 font-mono">{b.nameEn}</td>
                  <td className="p-4 font-extrabold text-neon">{b._count?.products || 0}</td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(b.id);
                        setFormData({ nameAr: b.nameAr, nameEn: b.nameEn, logo: b.logo || '' });
                      }}
                      className="p-1.5 rounded bg-dark-950 text-zinc-300 hover:text-neon"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.nameAr)}
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

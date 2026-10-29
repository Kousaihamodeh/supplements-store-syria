'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2, Edit, Upload, X, Layers } from 'lucide-react';

export default function CategoryManagementClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    sortOrder: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.85);
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const data = new FormData();
      const compressedBlob = await compressImage(files[0]);
      data.append('files', compressedBlob, files[0].name.replace(/\.[^/.]+$/, '.jpg'));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل رفع الصورة');

      if (result.urls && result.urls.length > 0) {
        setFormData((prev) => ({ ...prev, image: result.urls[0] }));
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn) {
      alert('يرجى كتابة الاسم بالعربية والإنجليزية');
      return;
    }

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert('انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مجدداً إلى لوحة التحكم.');
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'فشل عملية الحفظ');
      }

      setFormData({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', image: '', sortOrder: 0 });
      setEditingId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ القسم');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت تأكد من حذف القسم "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert('انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مجدداً إلى لوحة التحكم.');
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'فشل الحذف');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', image: '', sortOrder: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Category Add/Edit Form */}
      <div className="lg:col-span-5 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-5">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <h3 className="font-extrabold text-base text-white">
            {editingId ? 'تعديل قسم' : 'إضافة قسم جديد'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Image Upload Component */}
          <div>
            <label className="font-bold text-zinc-300 block mb-1.5">صورة القسم / Category Image</label>
            
            {formData.image ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-dark-950 border border-dark-700 group mb-2">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="p-2 rounded-lg bg-rose-950 text-rose-300 hover:text-white font-bold flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>حذف الصورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-dark-700 hover:border-neon rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-950/50 mb-2">
                <Upload className="w-7 h-7 text-neon mb-1.5" />
                <span className="font-bold text-white text-xs">
                  {uploading ? 'جاري رفع الصورة...' : 'اضغط لاختيار صورة القسم من جهازك'}
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">يدعم (JPG, PNG, WEBP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Direct URL input fallback */}
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="أو ضع رابط الصورة المباشر (Image URL)"
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon dir-ltr text-[11px]"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">اسم القسم بالعربية *</label>
            <input
              type="text"
              required
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="مثال: بروتينات"
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">English Category Name *</label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Proteins"
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon dir-ltr"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">ترتيب العرض (Sort Order)</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value || '0') })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2 px-3 text-white focus:border-neon"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all"
          >
            {editingId ? 'حفظ التعديلات' : 'إضافة القسم'}
          </button>
        </form>
      </div>

      {/* Categories List Table */}
      <div className="lg:col-span-7 bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-dark-800 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white">الأقسام الحالية ({initialCategories.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
              <tr>
                <th className="p-4">صورة القسم</th>
                <th className="p-4">اسم القسم</th>
                <th className="p-4">عدد المنتجات</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {initialCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    لا توجد أقسام مضافة حالياً
                  </td>
                </tr>
              ) : (
                initialCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-950/50">
                    <td className="p-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-dark-950 border border-dark-700 flex items-center justify-center">
                        {c.image ? (
                          <img src={c.image} alt={c.nameAr} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-6 h-6 text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.nameAr}</div>
                      <div className="text-zinc-400 font-mono text-[11px] mt-0.5">{c.nameEn}</div>
                    </td>
                    <td className="p-4 font-extrabold text-neon">{c._count?.products || 0}</td>
                    <td className="p-4 flex items-center justify-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setFormData({
                            nameAr: c.nameAr,
                            nameEn: c.nameEn,
                            descriptionAr: c.descriptionAr || '',
                            descriptionEn: c.descriptionEn || '',
                            image: c.image || '',
                            sortOrder: c.sortOrder || 0,
                          });
                        }}
                        className="p-2 rounded-lg bg-dark-950 text-zinc-300 hover:text-neon border border-dark-700 hover:border-neon"
                        title="تعديل القسم"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.nameAr)}
                        className="p-2 rounded-lg bg-rose-950/60 text-rose-300 hover:text-white border border-rose-900 hover:bg-rose-900"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}


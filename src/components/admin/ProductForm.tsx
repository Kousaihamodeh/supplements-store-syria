'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Plus, Trash2, Star, Check, Copy, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  brands: any[];
}

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameAr: initialData?.nameAr || '',
    nameEn: initialData?.nameEn || '',
    descriptionAr: initialData?.descriptionAr || '',
    descriptionEn: initialData?.descriptionEn || '',
    price: initialData?.price || '',
    oldPrice: initialData?.oldPrice || '',
    sku: initialData?.sku || `SUP-${Date.now().toString().slice(-6)}`,
    stock: initialData?.stock || 10,
    categoryId: initialData?.categoryId || (categories[0]?.id || ''),
    brandId: initialData?.brandId || '',
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    isNew: initialData?.isNew || false,
    isOnSale: initialData?.isOnSale || false,
  });

  const [images, setImages] = useState<{ url: string; isMain: boolean; sortOrder: number }[]>(
    initialData?.images || []
  );

  const [variants, setVariants] = useState<{ size: string; flavor: string; priceAdjustment: number; stock: number; sku: string }[]>(
    initialData?.variants || []
  );

  const [uploading, setUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Helper to compress image on client-side before upload to prevent network timeouts and read-only errors
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      // If SVG or GIF, don't re-compress on canvas
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
            canvas.toBlob(
              (blob) => {
                resolve(blob || file);
              },
              'image/jpeg',
              0.85
            );
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

  // Multi Image Drag & Drop / Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const data = new FormData();
      for (const file of Array.from(files)) {
        const compressedBlob = await compressImage(file);
        data.append('files', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'فشل في رفع الصور');
      }

      // When newly uploaded, mark the first newly uploaded image as main and demote any previous images!
      const newImgs = result.urls.map((url: string, idx: number) => ({
        url,
        isMain: idx === 0,
        sortOrder: idx,
      }));

      setImages((prev) => {
        // Demote previous images to isMain: false so the new upload becomes the main image!
        const previousDemoted = prev.map((img) => ({
          ...img,
          isMain: false,
        }));
        return [...newImgs, ...previousDemoted];
      });
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفع الصور');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Dedicated Replace Main Image Handler
  const handleReplaceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const compressedBlob = await compressImage(file);
      const data = new FormData();
      data.append('files', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'فشل في رفع الصورة');

      const newUrl = result.urls[0];
      if (!newUrl) throw new Error('لم يتم استلام رابط الصورة');

      // Replace main image or replace entire image list with this new primary image
      setImages((prev) => {
        if (prev.length === 0) {
          return [{ url: newUrl, isMain: true, sortOrder: 0 }];
        }
        // If there's an image marked isMain, replace that exact image!
        const mainIdx = prev.findIndex((img) => img.isMain);
        const targetIdx = mainIdx >= 0 ? mainIdx : 0;
        const next = [...prev];
        next[targetIdx] = { url: newUrl, isMain: true, sortOrder: 0 };
        return next;
      });

      alert('تم استبدال الصورة بنجاح! اضغط على (حفظ التعديلات) في الأسفل لتثبيت التغيير.');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء استبدال الصورة');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleClearImages = () => {
    if (images.length === 0) return;
    if (confirm('هل تريد حذف جميع الصور الحالية لرفع صورة جديدة بدلاً منها؟')) {
      setImages([]);
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: directUrl.trim(),
        isMain: prev.length === 0,
        sortOrder: prev.length,
      },
    ]);
    setDirectUrl('');
  };

  const setMainImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isMain: i === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((i) => i.isMain)) {
        next[0].isMain = true;
      }
      return next;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: '', flavor: '', priceAdjustment: 0, stock: formData.stock, sku: '' },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr || !formData.nameEn || !formData.price || !formData.categoryId || !formData.sku) {
      alert('يرجى تعبئة الحقول الأساسية المطلوبة');
      return;
    }

    setLoading(true);

    try {
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/products/${initialData.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const hasMain = images.some((img) => img.isMain);
      const sanitizedImages = images.map((img, idx) => ({
        ...img,
        isMain: hasMain ? Boolean(img.isMain) : idx === 0,
        sortOrder: idx,
      }));

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: sanitizedImages,
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');

      alert(isEdit ? 'تم تعديل المنتج وحفظ الصور بنجاح!' : 'تم إضافة ونشر المنتج بنجاح!');
      window.location.href = '/admin/products';
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في عملية الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      
      {/* 1. Multi Image Upload Manager */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-neon" />
              <span>صور المنتج / Product Images</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              يمكنك استبدال الصورة الحالية مباشرة، أو رفع عدة صور لمعرض المنتج
            </p>
          </div>

          {images.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 bg-neon/10 hover:bg-neon/20 text-neon border border-neon/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
                <span>{uploading ? 'جاري الرفع...' : 'استبدال الصورة الرئيسية بملف جديد'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearImages}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="حذف جميع الصور"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الكل</span>
              </button>
            </div>
          )}
        </div>

        {/* Current Images Gallery / Thumbnails */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span>الصور المرفقة حالياً ({images.length})</span>
              <span className="text-[11px] text-zinc-500">⭐ الصورة المميزة بالإطار الأخضر هي التي تظهر في المتجر</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-xl overflow-hidden bg-dark-950 border-2 transition-all ${
                    img.isMain ? 'border-neon ring-2 ring-neon/40 shadow-md shadow-neon/10' : 'border-dark-700 hover:border-dark-500'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-dark-950">
                    <img
                      src={img.url}
                      alt={`Product preview ${idx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Main Badge */}
                  {img.isMain && (
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-neon text-dark-950 font-black text-[10px] shadow">
                      ⭐ رئيسية
                    </span>
                  )}

                  {/* Actions Bar */}
                  <div className="p-1.5 bg-dark-900/95 border-t border-dark-800 flex items-center justify-between gap-1">
                    {!img.isMain ? (
                      <button
                        type="button"
                        onClick={() => setMainImage(idx)}
                        className="text-[10px] font-bold text-zinc-400 hover:text-neon flex items-center gap-1 py-1 px-1.5 rounded hover:bg-dark-800 transition-colors"
                        title="تعيين كصورة رئيسية للمتجر"
                      >
                        <Star className="w-3 h-3 text-neon" />
                        <span>رئيسية</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-neon px-1">المعروضة</span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-200 flex items-center gap-1 py-1 px-1.5 rounded hover:bg-rose-950/60 transition-colors ml-auto"
                      title="حذف هذه الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag & Drop Upload Zone for Additional or New Images */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-zinc-300 block">
            {images.length > 0 ? 'إضافة صور إضافية للمعرض أو رفع صور جديدة:' : 'رفع صور للمنتج:'}
          </label>
          <label className="border-2 border-dashed border-dark-700 hover:border-neon rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-950/40 hover:bg-dark-950">
            <Upload className="w-8 h-8 text-neon mb-2" />
            <span className="text-sm font-bold text-white text-center">
              {uploading ? 'جاري رفع ومعالجة الصور...' : 'اسحب الصور وأفلتها هنا، أو اضغط للاختيار من جهازك'}
            </span>
            <span className="text-xs text-zinc-500 mt-1">يدعم رفع عدة صور دفعة واحدة (JPG, PNG, WEBP)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Or enter Direct Image URL */}
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            placeholder="أو الصق رابط صورة مباشر من الإنترنت (https://...)"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white dir-ltr focus:border-neon focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            disabled={!directUrl.trim()}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-neon font-bold text-xs rounded-xl border border-dark-600 disabled:opacity-50"
          >
            إضافة الرابط
          </button>
        </div>

        <div className="p-3 bg-neon/5 border border-neon/20 rounded-xl text-xs text-zinc-300 space-y-1">
          <div className="font-bold text-neon flex items-center gap-1.5">
            <span>💡 طريقة تعديل صورة المنتج بسهولة:</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-zinc-400 text-[11px]">
            <li>اضغط على زر <strong>«استبدال الصورة الرئيسية بملف جديد»</strong> لاختيار الصورة الجديدة من جهازك مباشرة.</li>
            <li>أو احذف الصورة القديمة بزر <strong>«حذف»</strong> ثم اسحب الصورة الجديدة إلى مربع الرفع.</li>
            <li>بعد ظهور الصورة الجديدة، انزل لأسفل الصفحة واضغط <strong>«حفظ التعديلات»</strong> لتثبيتها في المتجر فوراً.</li>
          </ol>
        </div>
      </div>

      {/* 2. Basic Information (Bilingual) */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-base text-white">البيانات الأساسية / Basic Info</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">اسم المنتج باللغة العربية *</label>
            <input
              type="text"
              required
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="مثال: واي بروتين جولد ستاندرد"
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">English Product Name *</label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Gold Standard 100% Whey"
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none dir-ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">الوصف بالعربية</label>
            <textarea
              rows={4}
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">English Description</label>
            <textarea
              rows={4}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none dir-ltr"
            ></textarea>
          </div>
        </div>
      </div>

      {/* 3. Pricing, Stock & Relations */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-base text-white">السعر والمخزون والتصنيف</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">السعر ($) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">السعر السابق (لـ الخصم)</label>
            <input
              type="number"
              value={formData.oldPrice}
              onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">المخزون (الكمية) *</label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value || '0') })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">رمز SKU *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-300 block mb-1">القسم / Category *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-sm text-white focus:border-neon focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr} / {c.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Badges Toggles */}
        <div className="flex flex-wrap gap-6 pt-3 border-t border-dark-800 text-xs font-bold text-zinc-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="accent-neon w-4 h-4"
            />
            <span>منتج مميز (Featured)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBestSeller}
              onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
              className="accent-neon w-4 h-4"
            />
            <span>الأكثر مبيعاً (Best Seller)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNew}
              onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              className="accent-neon w-4 h-4"
            />
            <span>وصل حديثاً (New)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOnSale}
              onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
              className="accent-neon w-4 h-4"
            />
            <span>عليها عرض / تنزيلات (On Sale)</span>
          </label>
        </div>
      </div>

      {/* 4. Dynamic Variants (Sizes & Flavors) */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <h3 className="font-extrabold text-base text-white">الخيارات والأحجام والنكهات (Variants)</h3>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1.5 rounded-lg bg-dark-950 border border-dark-700 text-neon font-bold text-xs hover:border-neon flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة خيار جديد</span>
          </button>
        </div>

        {variants.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">لا توجد خيارات مخصصة لهذا المنتج</p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="p-3 bg-dark-950 rounded-xl border border-dark-800 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                <input
                  type="text"
                  placeholder="الحجم (مثال: 5 lbs)"
                  value={v.size}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[i].size = e.target.value;
                    setVariants(copy);
                  }}
                  className="bg-dark-900 border border-dark-700 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="النكهة (مثال: شوكولا)"
                  value={v.flavor}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[i].flavor = e.target.value;
                    setVariants(copy);
                  }}
                  className="bg-dark-900 border border-dark-700 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="تعديل السعر"
                  value={v.priceAdjustment}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[i].priceAdjustment = parseFloat(e.target.value || '0');
                    setVariants(copy);
                  }}
                  className="bg-dark-900 border border-dark-700 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="المخزون"
                  value={v.stock}
                  onChange={(e) => {
                    const copy = [...variants];
                    copy[i].stock = parseInt(e.target.value || '0');
                    setVariants(copy);
                  }}
                  className="bg-dark-900 border border-dark-700 rounded-lg py-1.5 px-3 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-1.5 rounded bg-rose-950 text-rose-400 hover:text-rose-100 shrink-0 m-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright transition-all shadow-lg"
        >
          {loading ? 'جاري الحفظ...' : initialData?.id ? 'تعديل المنتج' : 'نشر المنتج جديد'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3.5 rounded-xl bg-dark-900 border border-dark-700 text-zinc-300 font-bold text-sm"
        >
          إلغاء
        </button>
      </div>

    </form>
  );
}

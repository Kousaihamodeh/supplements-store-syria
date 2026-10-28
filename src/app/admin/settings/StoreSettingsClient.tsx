'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, MapPin, Phone, MessageCircle, Instagram, CheckCircle2, Database, ShieldCheck } from 'lucide-react';

export default function StoreSettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  const handleBackup = async () => {
    setBackingUp(true);
    setBackupMessage('');
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ الاحتياطي');
      setBackupMessage(data.message || 'تم إنشاء النسخة الاحتياطية بنجاح!');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setBackingUp(false);
    }
  };

  const [formData, setFormData] = useState({
    storeNameAr: initialSettings?.storeNameAr || 'متجر المكملات الغذائية',
    storeNameEn: initialSettings?.storeNameEn || 'SUPPLEMENTS STORE',
    phone: initialSettings?.phone || '0938229497',
    whatsapp: initialSettings?.whatsapp || '0938229497',
    instagram: initialSettings?.instagram || '@supplement_store_syria',
    addressAr: initialSettings?.addressAr || 'دمشق – جرمانا – ساحة الكرامة – مقابل MTN',
    addressEn: initialSettings?.addressEn || 'Damascus – Jaramana – Al-Karama Square – opposite MTN',
    googleMapsUrl: initialSettings?.googleMapsUrl || 'https://maps.google.com/?q=33.488506,36.340218',
    latitude: initialSettings?.latitude || 33.488506,
    longitude: initialSettings?.longitude || 36.340218,
    heroTitleAr: initialSettings?.heroTitleAr || 'كل ما تحتاجه لأداء أقوى',
    heroTitleEn: initialSettings?.heroTitleEn || 'Fuel Your Performance.',
    heroSubtitleAr: initialSettings?.heroSubtitleAr || 'أحدث المكملات الغذائية الرياضية العالمية الأصلية 100% مع خدمة التوصيل السريع إلى جميع المحافظات السورية',
    heroSubtitleEn: initialSettings?.heroSubtitleEn || '100% Authentic sports supplements with fast shipping across all Syrian governorates',
    currencyAr: initialSettings?.currencyAr || 'ل.س',
    currencyEn: initialSettings?.currencyEn || 'SYP',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('فشل الحفظ');

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في عملية الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto text-xs">
      
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-neon/10 border border-neon/40 text-neon font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ إعدادات المتجر ورابط خرائط جوجل بنجاح!</span>
        </div>
      )}

      {/* Backup & Data Safety Box */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-neon" />
            <span>النسخ الاحتياطي وحماية بيانات المتجر (Database & Photos Backup)</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded bg-neon/10 border border-neon/30 text-neon font-bold text-[10px]">
            محفوظة بأمان 100%
          </span>
        </div>

        <p className="text-zinc-300 text-xs leading-relaxed">
          جميع المنتجات والصور التي تقوم برفعها محفوظة بشكل دائم في قاعدة البيانات وتجلد الصور المحلي (`public/uploads`).
          يمكنك أخذ نسخة احتياطية إضافية بضغطة زر واحدة لحفظ كافة المنتجات والصور في مجلد الأرشيف الخاص بك.
        </p>

        {backupMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{backupMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleBackup}
          disabled={backingUp}
          className="px-5 py-2.5 rounded-xl bg-dark-950 border border-dark-700 text-neon font-extrabold text-xs hover:border-neon transition-all flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          <span>{backingUp ? 'جاري إنشاء النسخة الاحتياطية...' : 'أخذ نسخة احتياطية للبيانات والصور الآن (Create Backup Now)'}</span>
        </button>
      </div>

      {/* 1. Google Maps & Location Settings */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-dark-800 pb-3">
          <MapPin className="w-4 h-4 text-neon" />
          <span>إعدادات الخريطة والعنوان (Google Maps & Address)</span>
        </h3>

        <div>
          <label className="font-bold text-zinc-300 block mb-1">رابط خرائط جوجل الرسمي (Google Maps Share URL) *</label>
          <input
            type="url"
            required
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            placeholder="https://www.google.com/maps/..."
            className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr font-mono"
          />
          <p className="text-[10px] text-zinc-400 mt-1">
            يمكنك تغيير هذا الرابط بسهولة هنا في أي وقت دون الحاجة لتعديل الكود البرمجي.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">عنوان المتجر بالعربية *</label>
            <input
              type="text"
              required
              value={formData.addressAr}
              onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">Store Address English *</label>
            <input
              type="text"
              required
              value={formData.addressEn}
              onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">خط العرض (Latitude)</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value || '0') })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">خط الطول (Longitude)</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value || '0') })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-dark-800 pb-3">
          <Phone className="w-4 h-4 text-neon" />
          <span>أرقام ومعلومات التواصل</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">رقم الهاتف / Call</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">رقم الواتساب / WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">حساب الإنستغرام / Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Titles */}
      <div className="bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
        <h3 className="font-extrabold text-sm text-white border-b border-dark-800 pb-3">
          عناوين الواجهة الرئيسية (Hero Titles)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-zinc-300 block mb-1">العنوان الرئيسي بالعربية</label>
            <input
              type="text"
              value={formData.heroTitleAr}
              onChange={(e) => setFormData({ ...formData, heroTitleAr: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-300 block mb-1">English Hero Title</label>
            <input
              type="text"
              value={formData.heroTitleEn}
              onChange={(e) => setFormData({ ...formData, heroTitleEn: e.target.value })}
              className="w-full bg-dark-950 border border-dark-700 rounded-xl py-2.5 px-4 text-white focus:border-neon dir-ltr"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3.5 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all shadow-lg flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات بالكامل'}</span>
      </button>

    </form>
  );
}

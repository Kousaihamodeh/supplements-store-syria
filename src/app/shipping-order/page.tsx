'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { Truck, MapPin, CheckCircle, MessageCircle, ArrowLeft, ArrowRight, ShieldCheck, Phone } from 'lucide-react';

interface ShippingArea {
  id: string;
  governorateAr: string;
  governorateEn: string;
  shippingFee: number;
}

export default function SyrianShippingOrderPage() {
  const { locale, t } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const isRtl = locale === 'ar';

  const [shippingAreas, setShippingAreas] = useState<ShippingArea[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [shippingFee, setShippingFee] = useState<number>(0);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cityArea: '',
    address: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any>(null);

  useEffect(() => {
    fetch('/api/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShippingAreas(data);
          if (data.length > 0) {
            setSelectedGovernorate(data[0].governorateAr);
            setShippingFee(data[0].shippingFee);
          }
        }
      })
      .catch((err) => console.error('Failed to load shipping areas', err));
  }, []);

  const handleGovernorateChange = (govName: string) => {
    setSelectedGovernorate(govName);
    const found = shippingAreas.find((a) => a.governorateAr === govName || a.governorateEn === govName);
    if (found) {
      setShippingFee(found.shippingFee);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const grandTotal = cartTotal + shippingFee;

  const handleSubmitAndSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.cityArea) {
      alert('يرجى ملء كافة الحقول المطلوبة (الاسم، رقم الواتساب، المحافظة، والمركز/العنوان)');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save order into Database via API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName,
          customerPhone: formData.phone,
          governorate: selectedGovernorate,
          cityArea: formData.cityArea,
          address: formData.address,
          notes: formData.notes,
          shippingFee,
          isDirectShippingOrder: true,
          items: cartItems.map((item) => ({
            productId: item.productId,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            variantInfo: [item.size, item.flavor].filter(Boolean).join(' / '),
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في تثبيت الطلب');

      setOrderCreated(data);
      clearCart();

      // 2. Pre-format professional WhatsApp text & open WhatsApp directly
      const itemsListText = cartItems.length > 0 
        ? cartItems
            .map((i) => {
              const vInfo = [i.size, i.flavor].filter(Boolean).join('/');
              return `• ${i.nameAr}${vInfo ? ` (${vInfo})` : ''} × ${i.quantity} = ${i.price * i.quantity} $`;
            })
            .join('\n')
        : '• طلب استفسار شحن مباشر للمحافظات';

      const whatsappMessage = 
        `*📦 طلب شحن جديد للمحافظات - SUPPLEMENTS STORE*\n` +
        `----------------------------------------\n` +
        `🔖 *رقم الطلب:* ${data.orderNumber}\n` +
        `👤 *اسم الزبون:* ${formData.fullName}\n` +
        `📱 *رقم التواصل:* ${formData.phone}\n` +
        `📍 *المحافظة:* ${selectedGovernorate}\n` +
        `🏙️ *المنطقة/المدينة:* ${formData.cityArea}\n` +
        `🏠 *العنوان التفصيلي:* ${formData.address}\n` +
        (formData.notes ? `📝 *ملاحظات:* ${formData.notes}\n` : '') +
        `----------------------------------------\n` +
        `🛒 *المنتجات المطلوبة:*\n${itemsListText}\n` +
        `----------------------------------------\n` +
        `💵 *المجموع الفرعي:* ${cartTotal.toLocaleString()} $\n` +
        `🚚 *أجور الشحن (${selectedGovernorate}):* ${shippingFee.toLocaleString()} $\n` +
        `💰 *المبلغ الإجمالي المطلق:* ${grandTotal.toLocaleString()} $\n\n` +
        `يرجى تأكيد الاستلام والتجهيز للشحن. شكراً لكم!`;

      const encodedText = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/963938229497?text=${encodedText}`, '_blank');
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تثبيت الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center m-auto text-emerald-400">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-white">تم تثبيت طلب الشحن بنجاح!</h1>
        <p className="text-zinc-300">
          تم حفظ معلومات الطلب في قاعدة البيانات وتم تحويل التفاصيل إلى الواتساب للمتابعة الفورية.
        </p>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 text-right space-y-3 text-sm text-zinc-300 shadow-xl">
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>رقم التثبيت:</span>
            <span className="font-mono font-extrabold text-neon">{orderCreated.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>الزبون:</span>
            <span className="font-bold text-white">{orderCreated.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>المحافظة والعنوان:</span>
            <span className="font-bold text-white">{orderCreated.governorate} - {orderCreated.address}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-black text-white">
            <span>المبلغ الإجمالي المكتمل:</span>
            <span className="text-neon">{formatPrice(orderCreated.total, locale)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href={`https://wa.me/963938229497?text=${encodeURIComponent(`أهلاً، أود الاستفسار عن طلب الشحن رقم ${orderCreated.orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>متابعة الشحن عبر الواتساب (0938229497)</span>
          </a>
          <Link
            href="/"
            className="px-6 py-4 rounded-xl bg-dark-900 border border-dark-700 text-white font-bold text-base hover:border-neon transition-colors"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-dark-900 via-dark-950 to-dark-900 p-8 rounded-3xl border border-dark-800 text-center space-y-3 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-xs">
          <Truck className="w-4 h-4" />
          <span>
            {isRtl ? 'قسم الشحن والتوصيل للمحافظات السورية' : 'Syrian Governorates Delivery & Shipping'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          {isRtl ? 'تثبيت طلب الشحن وإرساله عبر الواتساب' : 'Confirm Shipping Order & Send via WhatsApp'}
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto">
          {isRtl
            ? 'أدخل معلومات الشحن الخاصة بك ليتم تثبيت الطلب مباشرة في قاعدة البيانات وإرسال ملخص الشحن الفوري إلى إدارة المتجر عبر الواتساب.'
            : 'Enter your shipping details below to register your order and send the instant summary directly to our team via WhatsApp.'}
        </p>
      </div>

      <form onSubmit={handleSubmitAndSendWhatsApp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shipping Form Left Column */}
        <div className="lg:col-span-7 bg-dark-900 p-6 sm:p-8 rounded-3xl border border-dark-800 space-y-6 shadow-xl">
          <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-dark-800 pb-4">
            <MapPin className="w-5 h-5 text-neon" />
            <span>{isRtl ? 'معلومات شحن الزبون' : 'Customer Shipping Information'}</span>
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                {t.fullName} *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={isRtl ? 'أدخل اسمك الثلاثي' : 'Enter your full name'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                {t.phone} *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="09XXXXXXXX"
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none dir-ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                  {t.governorate} *
                </label>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none font-bold"
                >
                  {shippingAreas.map((area) => (
                    <option key={area.id} value={area.governorateAr}>
                      {isRtl ? area.governorateAr : area.governorateEn} ({formatPrice(area.shippingFee, locale)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                  {t.cityArea} *
                </label>
                <input
                  type="text"
                  name="cityArea"
                  required
                  value={formData.cityArea}
                  onChange={handleInputChange}
                  placeholder={isRtl ? 'مثال: وسط المدينة / شارع الثورة' : 'e.g. City Center / Main Street'}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                {t.addressDetails} *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder={isRtl ? 'الشارع - البناء - الطابق - معلم بارز' : 'Street - Building - Floor - Landmark'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1.5">
                {t.orderNotes}
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={isRtl ? 'أي تعليمات خاصة لشركة الشحن أو طريقة الاستلام...' : 'Any special instructions for shipping or pickup...'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-white focus:border-neon focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Order Summary & WhatsApp Action Right Column */}
        <div className="lg:col-span-5 bg-dark-900 p-6 sm:p-8 rounded-3xl border border-dark-800 space-y-6 shadow-xl">
          <h2 className="text-xl font-black text-white border-b border-dark-800 pb-4">
            {isRtl ? 'ملخص الطلب والشحن' : 'Order & Shipping Summary'}
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                {isRtl
                  ? 'السلة فارغة حالياً. يمكنك تثبيت طلب شحن مباشر وتأكيده عبر الواتساب.'
                  : 'Your cart is currently empty. You can still submit a direct shipping request and confirm via WhatsApp.'}
              </p>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-center text-xs border-b border-dark-800/60 pb-2">
                  <div>
                    <span className="font-bold text-white block">{isRtl ? item.nameAr : item.nameEn}</span>
                    <span className="text-zinc-400">
                      {isRtl ? 'الكمية:' : 'Qty:'} {item.quantity}
                    </span>
                  </div>
                  <span className="font-extrabold text-neon">{formatPrice(item.price * item.quantity, locale)}</span>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 pt-2 text-sm border-t border-dark-800">
            <div className="flex justify-between text-zinc-300">
              <span>{t.cartSubtotal}:</span>
              <span className="font-bold text-white">{formatPrice(cartTotal, locale)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>{t.shippingFee}:</span>
              <span className="font-bold text-neon">{formatPrice(shippingFee, locale)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800 flex justify-between items-center text-xl font-black">
            <span>{t.cartTotal}:</span>
            <span className="text-neon text-2xl">{formatPrice(grandTotal, locale)}</span>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-emerald-500 text-white font-extrabold text-base hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>
                {isRtl ? 'تثبيت الطلب وإرسال الرسالة للواتساب' : 'Confirm Order & Send via WhatsApp'}
              </span>
            </button>

            <p className="text-[11px] text-zinc-400 text-center">
              {isRtl
                ? 'سيتم تسجيل الطلب في القاعدة وفتح الواتساب (0938229497) مجهزاً بالنص الكامل للتأكيد.'
                : 'Your order will be saved and WhatsApp (0938229497) will open pre-filled with your order summary.'}
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}

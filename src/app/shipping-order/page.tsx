'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice, formatShippingFee } from '@/lib/utils';
import {
  Truck,
  MapPin,
  CheckCircle,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  Ticket,
  CreditCard,
  Banknote,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';

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
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('دمشق');
  const [shippingFee, setShippingFee] = useState<number>(30000);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'SHAM_CASH'>('CASH_ON_DELIVERY');
  const [copiedCode, setCopiedCode] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

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
        if (Array.isArray(data) && data.length > 0) {
          setShippingAreas(data);
          const defaultGov = data.find((a) => a.governorateAr === 'دمشق') || data[0];
          setSelectedGovernorate(defaultGov.governorateAr);
          setShippingFee(defaultGov.shippingFee);
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setIsValidatingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          subtotal: cartTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'كوبون الخصم غير صالح');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError(null);
      }
    } catch (err: any) {
      setCouponError('تعذر فحص الكوبون');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleCopyShamCash = () => {
    navigator.clipboard.writeText('48dcad728c1b5da891f804942f8fc9fd');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const productsFinalTotal = Math.max(0, cartTotal - discountAmount);

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
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod,
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

      const shippingText = formatShippingFee(shippingFee, selectedGovernorate, locale);
      const couponText = appliedCoupon 
        ? `\n🎟️ *كوبون خصم:* ${appliedCoupon.code} (-${appliedCoupon.discountAmount} $)`
        : '';
      const paymentMethodText = paymentMethod === 'SHAM_CASH'
        ? '💳 *طريقة الدفع:* شام كاش (المستفيد: حسين علي سفر - 48dcad728c1b5da891f804942f8fc9fd)'
        : '💵 *طريقة الدفع:* الدفع عند الاستلام (كاش)';

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
        `💵 *المجموع الفرعي:* ${cartTotal.toLocaleString()} $` +
        couponText +
        `\n💰 *إجمالي المنتجات النهائي:* ${productsFinalTotal.toLocaleString()} $\n` +
        `🚚 *أجور التوصيل/الشحن (${selectedGovernorate}):* ${shippingText}\n` +
        paymentMethodText +
        `\n\nيرجى تأكيد الاستلام والتجهيز للشحن. شكراً لكم!`;

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
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>طريقة الدفع:</span>
            <span className="font-bold text-white">
              {orderCreated.paymentMethod === 'SHAM_CASH' ? '📱 شام كاش (Sham Cash)' : '💵 الدفع عند الاستلام (كاش)'}
            </span>
          </div>
          {orderCreated.discount > 0 && (
            <div className="flex justify-between border-b border-dark-800 pb-2 text-emerald-400 font-bold">
              <span>الخصم المطبق:</span>
              <span>- {formatPrice(orderCreated.discount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>أجور الشحن/التوصيل:</span>
            <span className="font-bold text-zinc-200">
              {formatShippingFee(orderCreated.shippingFee, orderCreated.governorate, locale)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-black text-white">
            <span>إجمالي المنتجات:</span>
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
            ? 'توصيل داخل دمشق (30,000 ل.س) • شحن لكافة المحافظات (25,000 ل.س) • ريف دمشق بالتنسيق المباشر'
            : 'Delivery inside Damascus (30,000 SYP) • Shipping to all governorates (25,000 SYP) • Rif Dimashq upon contact'}
        </p>
      </div>

      <form onSubmit={handleSubmitAndSendWhatsApp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shipping Form Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-dark-900 p-6 sm:p-8 rounded-3xl border border-dark-800 space-y-6 shadow-xl">
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
                        {isRtl ? area.governorateAr : area.governorateEn} ({formatShippingFee(area.shippingFee, area.governorateAr, locale)})
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

          {/* Payment Method Selector Section */}
          <div className="bg-dark-900 p-6 sm:p-8 rounded-3xl border border-dark-800 space-y-4 shadow-xl">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-neon" />
              <span>{isRtl ? 'طريقة الدفع' : 'Payment Method'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-neon bg-neon/10 text-white shadow-md'
                    : 'border-dark-700 bg-dark-950 text-zinc-300 hover:border-dark-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'CASH_ON_DELIVERY' ? 'border-neon bg-neon text-dark-950' : 'border-zinc-500'
                }`}>
                  {paymentMethod === 'CASH_ON_DELIVERY' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-neon" />
                    <span>{isRtl ? 'الدفع عند الاستلام (كاش)' : 'Cash on Delivery'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isRtl ? 'تدفع نقداً لشركة الشحن أو مندوب التوصيل عند استلام الطلب.' : 'Pay cash upon delivery or courier pickup.'}
                  </p>
                </div>
              </button>

              {/* Sham Cash option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('SHAM_CASH')}
                className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-3 ${
                  paymentMethod === 'SHAM_CASH'
                    ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-md ring-1 ring-cyan-400/40'
                    : 'border-dark-700 bg-dark-950 text-zinc-300 hover:border-cyan-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'SHAM_CASH' ? 'border-cyan-400 bg-cyan-400 text-dark-950' : 'border-zinc-500'
                }`}>
                  {paymentMethod === 'SHAM_CASH' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5 text-cyan-300">
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <span>{isRtl ? 'شام كاش (Sham Cash)' : 'Sham Cash Digital Wallet'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {isRtl ? 'تحويل فوري عبر تطبيق شام كاش أو مسح رمز الـ QR.' : 'Instant transfer via Sham Cash app or QR code scan.'}
                  </p>
                </div>
              </button>
            </div>

            {/* Sham Cash Info & QR Card */}
            {paymentMethod === 'SHAM_CASH' && (
              <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-dark-950 to-blue-950/30 border-2 border-cyan-500/50 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="font-black text-cyan-300 text-sm">بيانات حساب شام كاش للتحويل</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold">
                    حساب معتمد
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-7 space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-400 block mb-0.5 font-bold">اسم صاحب الحساب:</span>
                      <div className="font-black text-white text-base">حسين علي سفر</div>
                    </div>

                    <div>
                      <span className="text-zinc-400 block mb-1 font-bold">رمز الحساب (Wallet Code):</span>
                      <div className="flex items-center gap-2 bg-dark-900 border border-cyan-800/80 rounded-xl p-2.5 font-mono text-cyan-300 text-xs dir-ltr select-all">
                        <span className="truncate flex-1 font-extrabold">48dcad728c1b5da891f804942f8fc9fd</span>
                        <button
                          type="button"
                          onClick={handleCopyShamCash}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 transition-colors"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed bg-dark-900/60 p-2.5 rounded-xl border border-dark-800">
                      💡 <strong>طريقة الدفع:</strong> حوّل المبلغ عبر تطبيق شام كاش، ثم اضغط على زر <strong>تثبيت الطلب وإرسال الرسالة للواتساب</strong> لإرسال تفاصيل الشحن وإشعار التحويل.
                    </p>
                  </div>

                  {/* QR Code Display */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-dark-900 rounded-2xl border border-cyan-800/50 text-center">
                    <div className="relative w-36 h-36 rounded-xl overflow-hidden border-2 border-cyan-400/80 shadow-lg">
                      <Image
                        src="/images/shamcash-qr.jpg"
                        alt="شام كاش - حسين علي سفر"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-cyan-300 font-bold mt-2">
                      امسح الـ QR عبر تطبيق شام كاش
                    </span>
                  </div>
                </div>
              </div>
            )}
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

          {/* Coupon Code Section */}
          <div className="p-4 bg-dark-950 rounded-2xl border border-dark-800 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-neon" />
              <span>{isRtl ? 'كوبون خصم إضافي' : 'Discount Coupon'}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isRtl ? 'رمز الكوبون' : 'Coupon code'}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:border-neon focus:outline-none"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-3 py-2 bg-rose-950 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold hover:bg-rose-900"
                >
                  {isRtl ? 'إلغاء' : 'Remove'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-neon text-dark-950 font-black rounded-xl text-xs hover:bg-neon-bright transition-all disabled:opacity-50"
                >
                  {isValidatingCoupon ? '...' : (isRtl ? 'تطبيق' : 'Apply')}
                </button>
              )}
            </div>

            {couponError && (
              <p className="text-[11px] text-rose-400 font-bold">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold pt-1">
                <span>تم تطبيق الكوبون ({appliedCoupon.code})</span>
                <span>- {formatPrice(appliedCoupon.discountAmount, locale)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 text-sm border-t border-dark-800">
            <div className="flex justify-between text-zinc-300">
              <span>{t.cartSubtotal}:</span>
              <span className="font-bold text-white">{formatPrice(cartTotal, locale)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>{isRtl ? 'خصم الكوبون:' : 'Coupon Discount:'}</span>
                <span>- {formatPrice(discountAmount, locale)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-300">
              <span>{t.shippingFee}:</span>
              <span className="font-bold text-zinc-100">
                {formatShippingFee(shippingFee, selectedGovernorate, locale)}
              </span>
            </div>

            <div className="flex justify-between text-zinc-300 text-xs pt-1 border-t border-dark-800/50">
              <span>طريقة الدفع:</span>
              <span className="font-bold text-white">
                {paymentMethod === 'SHAM_CASH' ? '📱 شام كاش' : '💵 كاش عند الاستلام'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800 flex justify-between items-center text-xl font-black">
            <span>{isRtl ? 'إجمالي المنتجات:' : 'Products Total:'}</span>
            <span className="text-neon text-2xl">{formatPrice(productsFinalTotal, locale)}</span>
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

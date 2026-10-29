'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice, formatShippingFee } from '@/lib/utils';
import { ShoppingBag, CheckCircle, MessageCircle, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Truck, Ticket, Tag } from 'lucide-react';

interface ShippingArea {
  id: string;
  governorateAr: string;
  governorateEn: string;
  shippingFee: number;
}

export default function CheckoutPage() {
  const { locale, t } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [shippingAreas, setShippingAreas] = useState<ShippingArea[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('دمشق');
  const [shippingFee, setShippingFee] = useState<number>(30000);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const productsFinalTotal = Math.max(0, cartTotal - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent, sendWhatsApp = false) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.cityArea) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
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
      if (!res.ok) throw new Error(data.error || 'فشل في إتمام الطلب');

      setOrderCreated(data);
      clearCart();

      if (sendWhatsApp) {
        const itemsFormatted = cartItems
          .map((i) => {
            const vInfo = [i.size, i.flavor].filter(Boolean).join('/');
            return `- ${i.nameAr}${vInfo ? ` (${vInfo})` : ''} × ${i.quantity} = ${i.price * i.quantity} $`;
          })
          .join('\n');

        const shippingText = formatShippingFee(shippingFee, selectedGovernorate, locale);
        const couponText = appliedCoupon 
          ? `\n🎟️ كوبون خصم: ${appliedCoupon.code} (-${appliedCoupon.discountAmount} $)`
          : '';

        const text = encodeURIComponent(
          `*طلب جديد من موقع SUPPLEMENTS STORE*\n` +
          `رقم الطلب: ${data.orderNumber}\n` +
          `الاسم: ${formData.fullName}\n` +
          `الهاتف: ${formData.phone}\n` +
          `المحافظة: ${selectedGovernorate}\n` +
          `المنطقة/المدينة: ${formData.cityArea}\n` +
          `العنوان: ${formData.address}\n` +
          (formData.notes ? `ملاحظات: ${formData.notes}\n` : '') +
          `\n*المنتجات المطلوبة:*\n` +
          itemsFormatted +
          `\n\nالمجموع الفرعي للمنتجات: ${cartTotal} $` +
          couponText +
          `\n*إجمالي المنتجات: ${productsFinalTotal} $*` +
          `\nأجور التوصيل/الشحن: ${shippingText}`
        );
        window.open(`https://wa.me/963938229497?text=${text}`, '_blank');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-neon/10 border border-neon/40 flex items-center justify-center m-auto text-neon">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-white">{t.orderSuccessTitle}</h1>
        <p className="text-zinc-300">{t.orderSuccessDesc}</p>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 ltr:text-left rtl:text-right space-y-2 text-sm text-zinc-300">
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>{t.orderNumber}</span>
            <span className="font-extrabold text-neon">{orderCreated.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>{isRtl ? 'الاسم:' : 'Name:'}</span>
            <span className="font-bold text-white">{orderCreated.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>{isRtl ? 'المحافظة والعنوان:' : 'Address:'}</span>
            <span className="font-bold text-white">{orderCreated.governorate} - {orderCreated.address}</span>
          </div>
          {orderCreated.discount > 0 && (
            <div className="flex justify-between border-b border-dark-800 pb-2 text-emerald-400 font-bold">
              <span>{isRtl ? 'الخصم المطبق:' : 'Discount:'}</span>
              <span>- {formatPrice(orderCreated.discount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-dark-800 pb-2">
            <span>{isRtl ? 'أجور التوصيل والشحن:' : 'Shipping Fee:'}</span>
            <span className="font-bold text-zinc-200">
              {formatShippingFee(orderCreated.shippingFee, orderCreated.governorate, locale)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-black text-white">
            <span>{isRtl ? 'إجمالي المنتجات:' : 'Products Total:'}</span>
            <span className="text-neon">{formatPrice(orderCreated.total, locale)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href={`https://wa.me/963938229497?text=${encodeURIComponent(`أهلاً متجر المكملات، أريد الاستفسار عن طلبي رقم ${orderCreated.orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isRtl ? 'متابعة الطلب عبر الواتساب' : 'Track Order via WhatsApp'}</span>
          </a>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl bg-dark-900 border border-dark-700 text-white font-bold text-sm"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">{t.emptyCart}</h2>
        <Link href="/shop" className="inline-block px-6 py-3 rounded-xl bg-neon text-dark-950 font-bold text-sm">
          {t.shopNow}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-black text-white border-b border-dark-800 pb-4">{t.checkoutTitle}</h1>

      <form onSubmit={(e) => handleSubmitOrder(e, false)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer Form */}
        <div className="lg:col-span-7 bg-dark-900 p-6 sm:p-8 rounded-2xl border border-dark-800 space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-neon" />
            <span>{t.customerInformation}</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                {t.fullName} *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={isRtl ? 'أدخل اسمك الثلاثي' : 'Enter your full name'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                {t.phone} *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="09XXXXXXXX"
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none dir-ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                  {t.governorate} *
                </label>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none"
                >
                  {shippingAreas.map((area) => (
                    <option key={area.id} value={area.governorateAr}>
                      {isRtl ? area.governorateAr : area.governorateEn} ({formatShippingFee(area.shippingFee, area.governorateAr, locale)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                  {t.cityArea} *
                </label>
                <input
                  type="text"
                  name="cityArea"
                  required
                  value={formData.cityArea}
                  onChange={handleInputChange}
                  placeholder={isRtl ? 'مثال: جرمانا / الشعلان' : 'e.g. Jaramana / Al-Shaalan'}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                {t.addressDetails} *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder={isRtl ? 'الشارع - البناء - الطابق' : 'Street - Building - Floor'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                {t.orderNotes}
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={isRtl ? 'أي توجيهات خاصة بالتوصيل...' : 'Any special delivery instructions...'}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl py-3 px-4 text-sm text-white focus:border-neon focus:outline-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-5 bg-dark-900 p-6 sm:p-8 rounded-2xl border border-dark-800 space-y-6">
          <h2 className="text-lg font-black text-white border-b border-dark-800 pb-3">
            {isRtl ? 'تفاصيل المشتريات' : 'Order Summary'}
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-center text-xs border-b border-dark-800/60 pb-2">
                <div>
                  <span className="font-bold text-white block">{isRtl ? item.nameAr : item.nameEn}</span>
                  <span className="text-zinc-400">
                    {isRtl ? 'الكمية:' : 'Qty:'} {item.quantity}
                  </span>
                </div>
                <span className="font-extrabold text-neon">{formatPrice(item.price * item.quantity, locale)}</span>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="p-4 bg-dark-950 rounded-xl border border-dark-800 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-neon" />
              <span>{isRtl ? 'هل لديك كوبون خصم؟' : 'Have a coupon code?'}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isRtl ? 'أدخل رمز الكوبون' : 'Enter coupon code'}
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
              <span>{t.cartSubtotal}</span>
              <span className="font-bold">{formatPrice(cartTotal, locale)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>{isRtl ? 'خصم الكوبون:' : 'Coupon Discount:'}</span>
                <span>- {formatPrice(discountAmount, locale)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-300">
              <span>{t.shippingFee} ({selectedGovernorate})</span>
              <span className="font-bold text-zinc-100">
                {formatShippingFee(shippingFee, selectedGovernorate, locale)}
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
              className="w-full py-4 rounded-xl bg-neon text-dark-950 font-extrabold text-base hover:bg-neon-bright transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>{t.placeOrder}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmitOrder(e, true)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.placeOrderWhatsApp}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useCart } from '@/components/providers/CartProvider';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, CheckCircle, MessageCircle, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Truck } from 'lucide-react';

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

        const text = encodeURIComponent(
          `*طلب جديد من موقع SUPPLEMENTS STORE*\n` +
          `رقم الطلب: ${data.orderNumber}\n` +
          `الاسم: ${formData.fullName}\n` +
          `الهاتف: ${formData.phone}\n` +
          `المحافظة: ${selectedGovernorate}\n` +
          `المنطقة/المدينة: ${formData.cityArea}\n` +
          `العنوان: ${formData.address}\n\n` +
          `*المنتجات المطلوبة:*\n` +
          itemsFormatted +
          `\n\nالمجموع الفرعي: ${cartTotal} $\n` +
          `أجور الشحن: ${shippingFee} $\n` +
          `*الإجمالي: ${grandTotal} $*`
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
          <div className="flex justify-between pt-2 text-base font-black text-white">
            <span>{isRtl ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
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
                      {isRtl ? area.governorateAr : area.governorateEn} ({formatPrice(area.shippingFee, locale)})
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

          <div className="space-y-2 pt-2 text-sm border-t border-dark-800">
            <div className="flex justify-between text-zinc-300">
              <span>{t.cartSubtotal}</span>
              <span className="font-bold">{formatPrice(cartTotal, locale)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>{t.shippingFee} ({selectedGovernorate})</span>
              <span className="font-bold text-neon">{formatPrice(shippingFee, locale)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800 flex justify-between items-center text-xl font-black">
            <span>{t.cartTotal}</span>
            <span className="text-neon text-2xl">{formatPrice(grandTotal, locale)}</span>
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Calculator, Dumbbell, Flame, Zap, TrendingUp, Droplets, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

type GoalType = 'muscle' | 'bulk' | 'cut' | 'strength';

export function SupplementCalculator() {
  const { locale } = useLanguage();
  const isRtl = locale === 'ar';

  const [weight, setWeight] = useState<number>(75);
  const [goal, setGoal] = useState<GoalType>('muscle');

  const safeWeight = Math.min(Math.max(weight || 70, 35), 200);

  // Calculate daily protein & creatine targets based on goal
  const getCalculations = () => {
    switch (goal) {
      case 'bulk':
        return {
          proteinMin: Math.round(safeWeight * 1.8),
          proteinMax: Math.round(safeWeight * 2.2),
          creatineGrams: safeWeight >= 90 ? 6 : 5,
          waterLiters: (safeWeight * 0.045).toFixed(1),
          scoopsTextAr: '2 سكوب ماس جينر أو واي بروتين يومياً بين الوجبات وبعد التمرين',
          scoopsTextEn: '2 scoops of Mass Gainer or Whey Protein daily between meals & post-workout',
          recommendations: [
            { nameAr: 'ماس جينر (لتضخيم سريع)', nameEn: 'Mass Gainer', href: '/shop?category=mass-gainer' },
            { nameAr: 'كرياتين (للقوة والحجم)', nameEn: 'Creatine', href: '/shop?category=creatine-1' },
            { nameAr: 'كارب (طاقة وضخامة)', nameEn: 'Carbs', href: '/shop?category=carbs' },
          ],
        };
      case 'cut':
        return {
          proteinMin: Math.round(safeWeight * 2.1),
          proteinMax: Math.round(safeWeight * 2.5),
          creatineGrams: 5,
          waterLiters: (safeWeight * 0.05).toFixed(1),
          scoopsTextAr: '1 - 2 سكوب أيزو بروتين (صفر دهون وسكر) للحفاظ على العضل أثناء حرق الدهون',
          scoopsTextEn: '1–2 scoops of Iso Protein (zero fat/sugar) to preserve muscle while burning fat',
          recommendations: [
            { nameAr: 'أيزو بروتين (نقي للتنشيف)', nameEn: 'Iso Protein', href: '/shop?category=iso-protein' },
            { nameAr: 'منتجات التنحيف وحوارق الدهون', nameEn: 'Slimming & Fat Burners', href: '/shop?category=slimming-products' },
            { nameAr: 'فيتامينات ومعادن وأوميغا 3', nameEn: 'Vitamins & Omega-3', href: '/shop?category=vitamins-and-minerals' },
          ],
        };
      case 'strength':
        return {
          proteinMin: Math.round(safeWeight * 1.8),
          proteinMax: Math.round(safeWeight * 2.2),
          creatineGrams: safeWeight >= 85 ? 6 : 5,
          waterLiters: (safeWeight * 0.045).toFixed(1),
          scoopsTextAr: 'سكوب كرياتين يومياً + سكوب طاقة قبل التمرين لأداء أقصى في النادي',
          scoopsTextEn: '1 scoop Creatine daily + Pre-Workout before training for peak strength',
          recommendations: [
            { nameAr: 'مكملات قبل التمرين (Pre-Workout)', nameEn: 'Pre-Workout', href: '/shop?category=pre-workout' },
            { nameAr: 'كرياتين مونوهيدرات', nameEn: 'Creatine', href: '/shop?category=creatine-1' },
            { nameAr: 'محفزات التستوستيرون والأداء', nameEn: 'Testosterone Boosters', href: '/shop?category=testosterone-booster-1' },
          ],
        };
      case 'muscle':
      default:
        return {
          proteinMin: Math.round(safeWeight * 1.8),
          proteinMax: Math.round(safeWeight * 2.2),
          creatineGrams: 5,
          waterLiters: (safeWeight * 0.045).toFixed(1),
          scoopsTextAr: '1 - 2 سكوب واي بروتين يومياً (بعد التمرين مباشرة أو صباحاً)',
          scoopsTextEn: '1–2 scoops of Whey Protein daily (immediately post-workout or morning)',
          recommendations: [
            { nameAr: 'واي بروتين (Whey Protein)', nameEn: 'Whey Protein', href: '/shop?category=whey-protein' },
            { nameAr: 'كرياتين (Creatine)', nameEn: 'Creatine', href: '/shop?category=creatine-1' },
            { nameAr: 'أحماض أمينية (BCAA)', nameEn: 'Amino Acids (BCAA)', href: '/shop?category=amino-acids' },
          ],
        };
    }
  };

  const result = getCalculations();

  const goals: { id: GoalType; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'muscle',
      labelAr: 'بناء عضل صافي',
      labelEn: 'Lean Muscle',
      icon: <Dumbbell className="w-4 h-4" />,
    },
    {
      id: 'bulk',
      labelAr: 'تضخيم وزيادة وزن',
      labelEn: 'Bulking & Mass',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'cut',
      labelAr: 'تنشيف وخسارة دهون',
      labelEn: 'Cutting & Fat Loss',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      id: 'strength',
      labelAr: 'زيادة القوة والطاقة',
      labelEn: 'Strength & Power',
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 rounded-2xl sm:rounded-3xl border border-dark-700 p-4 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Neon Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-neon/10 blur-3xl rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon font-bold text-[11px] sm:text-xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>{isRtl ? 'أداة ذكية مجانية للرياضيين' : 'Free Smart Athlete Tool'}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white">
            {isRtl ? 'حاسبة احتياج البروتين والكرياتين اليومي 💪' : 'Smart Daily Protein & Creatine Calculator 💪'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            {isRtl
              ? 'أدخل وزنك واختر هدفك الرياضي لنحسب لك بدقة كمية البروتين والكرياتين اليومية والمكملات الأنسب لك'
              : 'Enter your body weight and fitness goal to calculate your exact daily protein & creatine targets and best supplements'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Left Side: Inputs (Weight & Goal) */}
          <div className="lg:col-span-6 space-y-5 bg-dark-950/90 p-4 sm:p-6 rounded-2xl border border-dark-800">
            
            {/* 1. Weight Input + Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-extrabold text-zinc-200">
                  {isRtl ? '1. وزنك الحالي (بالكيلوغرام):' : '1. Your Current Weight (kg):'}
                </label>
                <div className="flex items-center gap-1.5 bg-dark-900 border border-neon/50 rounded-xl px-3 py-1">
                  <input
                    type="number"
                    min={35}
                    max={200}
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value || '0', 10))}
                    className="w-12 bg-transparent text-neon font-black text-base sm:text-lg text-center focus:outline-none dir-ltr"
                  />
                  <span className="text-xs font-bold text-zinc-400">{isRtl ? 'كغ' : 'kg'}</span>
                </div>
              </div>

              <input
                type="range"
                min={40}
                max={140}
                value={safeWeight}
                onChange={(e) => setWeight(parseInt(e.target.value, 10))}
                className="w-full accent-neon cursor-pointer h-2 bg-dark-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono dir-ltr">
                <span>40 kg</span>
                <span>70 kg</span>
                <span>100 kg</span>
                <span>140 kg</span>
              </div>
            </div>

            {/* 2. Goal Selector */}
            <div className="space-y-2.5 pt-2 border-t border-dark-800">
              <label className="text-xs sm:text-sm font-extrabold text-zinc-200 block">
                {isRtl ? '2. اختر هدفك الرياضي:' : '2. Select Your Fitness Goal:'}
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {goals.map((g) => {
                  const active = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                        active
                          ? 'bg-neon text-dark-950 border-neon shadow-[0_0_15px_rgba(163,230,53,0.3)] font-extrabold'
                          : 'bg-dark-900 text-zinc-300 border-dark-700 hover:border-neon/50'
                      }`}
                    >
                      <span className="shrink-0">{g.icon}</span>
                      <span className="truncate">{isRtl ? g.labelAr : g.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Side: Calculated Results & Direct Category Links */}
          <div className="lg:col-span-6 bg-dark-950 p-4 sm:p-6 rounded-2xl border border-neon/40 space-y-5 shadow-xl">
            
            {/* Numbers Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
              <div className="bg-dark-900 p-3 sm:p-4 rounded-xl border border-dark-800">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 block">
                  {isRtl ? 'البروتين اليومي' : 'Daily Protein'}
                </span>
                <span className="text-base sm:text-2xl font-black text-neon mt-1 block dir-ltr">
                  {result.proteinMin}–{result.proteinMax}g
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {isRtl ? 'غرام / يومياً' : 'grams / day'}
                </span>
              </div>

              <div className="bg-dark-900 p-3 sm:p-4 rounded-xl border border-dark-800">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 block">
                  {isRtl ? 'الكرياتين اليومي' : 'Daily Creatine'}
                </span>
                <span className="text-base sm:text-2xl font-black text-amber-400 mt-1 block dir-ltr">
                  {result.creatineGrams}g
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {isRtl ? 'سـكوب واحد يومياً' : '1 scoop / day'}
                </span>
              </div>

              <div className="bg-dark-900 p-3 sm:p-4 rounded-xl border border-dark-800">
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  <span>{isRtl ? 'شرب الماء' : 'Daily Water'}</span>
                </span>
                <span className="text-base sm:text-2xl font-black text-sky-400 mt-1 block dir-ltr">
                  {result.waterLiters}L
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  {isRtl ? 'لتر ماء / يومياً' : 'liters / day'}
                </span>
              </div>
            </div>

            {/* Advice Box */}
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/25 text-xs text-zinc-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-neon shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isRtl ? result.scoopsTextAr : result.scoopsTextEn}
              </p>
            </div>

            {/* Recommended Categories Links */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-extrabold text-white block">
                {isRtl ? 'المكملات المرشحة لهدفك في متجرنا:' : 'Recommended Supplements for Your Goal:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((rec, idx) => (
                  <Link
                    key={idx}
                    href={rec.href}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900 border border-neon/50 text-neon font-bold text-xs hover:bg-neon hover:text-dark-950 transition-all shadow"
                  >
                    <span>{isRtl ? rec.nameAr : rec.nameEn}</span>
                    {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';

export function QuickEditPriceStock({
  productId,
  initialValue,
  field,
  suffix,
}: {
  productId: string;
  initialValue: number;
  field: 'price' | 'stock';
  suffix?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(String(initialValue));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isChanged = Number(value) !== initialValue && value.trim() !== '';

  const handleSave = async () => {
    if (!isChanged || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: Number(value) }),
      });
      if (!res.ok) throw new Error('فشل التحديث السريع');
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء التحديث');
      setValue(String(initialValue));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="relative flex items-center">
        <input
          type="number"
          step={field === 'price' ? 'any' : '1'}
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
          className={`w-20 bg-dark-950 border rounded-lg py-1 px-2 text-xs font-mono font-bold text-white focus:outline-none transition-colors dir-ltr text-center ${
            saved
              ? 'border-emerald-500 text-emerald-400'
              : isChanged
              ? 'border-neon'
              : field === 'stock' && Number(value) <= 5
              ? 'border-rose-800 text-rose-300'
              : 'border-dark-700 focus:border-neon'
          }`}
        />
        {suffix && <span className="text-xs font-bold text-neon mr-1 rtl:mr-1.5">{suffix}</span>}
      </div>

      {isChanged && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="p-1 rounded-md bg-neon text-dark-950 hover:bg-neon-bright transition-colors shadow"
          title="حفظ التعديل السريع"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>
      )}

      {saved && !isChanged && (
        <span className="text-emerald-400 text-[10px] font-bold flex items-center">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Copy, Trash2 } from 'lucide-react';

export default function ProductTableActions({ product }: { product: any }) {
  const router = useRouter();
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDuplicate = async () => {
    if (!confirm(`هل أنت تأكد من تكرار/نسخ المنتج "${product.nameAr}"؟`)) return;
    setDuplicating(true);

    try {
      const res = await fetch(`/api/products/${product.id}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تكرار المنتج');

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في النسخ');
    } finally {
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت تأكد من حذف المنتج "${product.nameAr}" بشكل نهائي؟`)) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('فشل الحذف');

      router.refresh();
    } catch (err: any) {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Edit button */}
      <Link
        href={`/admin/products/${product.id}`}
        className="p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-zinc-300 hover:text-neon hover:border-neon transition-colors"
        title="تعديل المنتج"
      >
        <Edit className="w-4 h-4" />
      </Link>

      {/* Duplicate Product button */}
      <button
        onClick={handleDuplicate}
        disabled={duplicating}
        className="p-1.5 rounded-lg bg-dark-950 border border-dark-700 text-amber-400 hover:text-amber-300 hover:border-amber-400 transition-colors"
        title="نسخ / تكرار المنتج (Duplicate Product)"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-400 hover:text-rose-200 transition-colors"
        title="حذف المنتج"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

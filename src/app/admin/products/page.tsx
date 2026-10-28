import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import ProductTableActions from './ProductTableActions';
import { QuickEditPriceStock } from './QuickEditPriceStock';
import { Plus, Package, Copy } from 'lucide-react';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
      images: { where: { isMain: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white">إدارة المنتجات / Products</h1>
          <p className="text-xs text-zinc-400 mt-1">إضافة، تعديل، حذف، ونسخ المنتجات مع إدارة الصورة الرئيسية</p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neon text-dark-950 font-extrabold text-sm hover:bg-neon-bright transition-all shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </Link>
      </div>

      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">الصورة</th>
                <th className="p-4">اسم المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">السعر</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    لا توجد منتجات حالياً. اضغط "إضافة منتج جديد" للبدء.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const img = p.images[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=200&auto=format&fit=crop&q=80';
                  return (
                    <tr key={p.id} className="hover:bg-dark-950/50 transition-colors">
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-dark-950 border border-dark-700">
                          <Image src={img} alt={p.nameAr} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{p.nameAr}</div>
                        <div className="text-[11px] text-zinc-400">{p.nameEn}</div>
                      </td>
                      <td className="p-4 font-semibold text-neon">{p.category.nameAr}</td>
                      <td className="p-4">
                        <QuickEditPriceStock
                          productId={p.id}
                          initialValue={p.price}
                          field="price"
                          suffix="$"
                        />
                      </td>
                      <td className="p-4">
                        <QuickEditPriceStock
                          productId={p.id}
                          initialValue={p.stock}
                          field="stock"
                        />
                      </td>
                      <td className="p-4 font-mono text-zinc-400">{p.sku}</td>
                      <td className="p-4">
                        <ProductTableActions product={p} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { autoBackupSafe } from '@/lib/backup-helper';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const source = await db.product.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        variants: true,
      },
    });

    if (!source) {
      return NextResponse.json({ error: 'Source product not found' }, { status: 404 });
    }

    const newNameAr = `${source.nameAr} (نسخة)`;
    const newNameEn = `${source.nameEn} (Copy)`;
    const newSku = `${source.sku}-COPY-${Date.now().toString().slice(-4)}`;

    const baseSlug = generateSlug(newNameEn);
    let slug = baseSlug;
    let count = 1;
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const duplicated = await db.$transaction(async (tx) => {
      return await tx.product.create({
        data: {
          nameAr: newNameAr,
          nameEn: newNameEn,
          slug,
          descriptionAr: source.descriptionAr,
          descriptionEn: source.descriptionEn,
          price: source.price,
          oldPrice: source.oldPrice,
          sku: newSku,
          stock: source.stock,
          categoryId: source.categoryId,
          brandId: source.brandId,
          isFeatured: false,
          isBestSeller: false,
          isNew: true,
          isOnSale: source.isOnSale,
          isActive: source.isActive,
          images: {
            create: source.images.map((img) => ({
              url: img.url,
              isMain: img.isMain,
              sortOrder: img.sortOrder,
            })),
          },
          variants: {
            create: source.variants.map((v) => ({
              size: v.size,
              flavor: v.flavor,
              priceAdjustment: v.priceAdjustment,
              stock: v.stock,
              sku: v.sku ? `${v.sku}-COPY` : null,
            })),
          },
        },
        include: {
          images: true,
          variants: true,
        },
      });
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error('Duplicate product error:', error);
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 });
  }
}

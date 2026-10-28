import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { autoBackupSafe } from '@/lib/backup-helper';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price,
      oldPrice,
      sku,
      stock,
      categoryId,
      brandId,
      isFeatured,
      isBestSeller,
      isNew,
      isOnSale,
      images,
      variants,
    } = body;

    // Execute in a single atomic database transaction
    const updated = await db.$transaction(async (tx) => {
      // Delete existing images & variants to rebuild fresh
      await tx.productImage.deleteMany({ where: { productId: params.id } });
      await tx.productVariant.deleteMany({ where: { productId: params.id } });

      return await tx.product.update({
        where: { id: params.id },
        data: {
          nameAr,
          nameEn,
          descriptionAr: descriptionAr || '',
          descriptionEn: descriptionEn || '',
          price: parseFloat(price),
          oldPrice: oldPrice ? parseFloat(oldPrice) : null,
          sku,
          stock: parseInt(stock),
          categoryId,
          brandId: brandId || null,
          isFeatured: Boolean(isFeatured),
          isBestSeller: Boolean(isBestSeller),
          isNew: Boolean(isNew),
          isOnSale: Boolean(isOnSale),
          images: {
            create: (images || []).map((img: any, idx: number) => ({
              url: img.url,
              isMain: img.isMain ?? idx === 0,
              sortOrder: img.sortOrder ?? idx,
            })),
          },
          variants: {
            create: (variants || []).map((v: any) => ({
              size: v.size || null,
              flavor: v.flavor || null,
              priceAdjustment: parseFloat(v.priceAdjustment || 0),
              stock: parseInt(v.stock || stock || 10),
              sku: v.sku || null,
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.price !== undefined) {
      const parsedPrice = parseFloat(body.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      dataToUpdate.price = parsedPrice;
    }

    if (body.stock !== undefined) {
      const parsedStock = parseInt(body.stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json({ error: 'Invalid stock' }, { status: 400 });
      }
      dataToUpdate.stock = parsedStock;
    }

    const updated = await db.product.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Quick patch product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to quick-update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.product.delete({
      where: { id: params.id },
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

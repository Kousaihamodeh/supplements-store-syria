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
      return NextResponse.json({ error: 'غير مصرح، يرجى تسجيل الدخول مجدداً' }, { status: 401 });
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

    const parsedPrice = parseFloat(String(price || 0)) || 0;
    const parsedOldPrice = oldPrice ? parseFloat(String(oldPrice)) || null : null;
    const parsedStock = parseInt(String(stock || 0), 10) || 0;

    // Delete existing images & variants sequentially without exclusive transaction locks
    await db.productImage.deleteMany({ where: { productId: params.id } });
    await db.productVariant.deleteMany({ where: { productId: params.id } });

    const hasMain = (images || []).some((img: any) => Boolean(img.isMain));
    const formattedImages = (images || []).map((img: any, idx: number) => ({
      url: img.url,
      isMain: hasMain ? Boolean(img.isMain) : idx === 0,
      sortOrder: img.sortOrder ?? idx,
    }));

    const formattedVariants = (variants || []).map((v: any) => ({
      size: v.size || null,
      flavor: v.flavor || null,
      priceAdjustment: parseFloat(String(v.priceAdjustment || 0)) || 0,
      stock: parseInt(String(v.stock || parsedStock || 10), 10) || 10,
      sku: v.sku || null,
    }));

    const updated = await db.product.update({
      where: { id: params.id },
      data: {
        nameAr: String(nameAr || '').trim(),
        nameEn: String(nameEn || '').trim(),
        descriptionAr: descriptionAr || '',
        descriptionEn: descriptionEn || '',
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        sku: String(sku || '').trim(),
        stock: parsedStock,
        categoryId,
        brandId: brandId || null,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNew: Boolean(isNew),
        isOnSale: Boolean(isOnSale),
        images: {
          create: formattedImages,
        },
        variants: {
          create: formattedVariants,
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    try {
      autoBackupSafe();
    } catch (e) {}

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath(`/product/${params.id}`);
      if (updated.slug) revalidatePath(`/product/${updated.slug}`);
    } catch (e) {}

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'فشل في تعديل المنتج' }, { status: 500 });
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

    try {
      autoBackupSafe();
    } catch (e) {}

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');
    } catch (e) {}

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

    try {
      autoBackupSafe();
    } catch (e) {}

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

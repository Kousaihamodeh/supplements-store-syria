import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { autoBackupSafe } from '@/lib/backup-helper';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const featured = searchParams.get('featured');
    const bestSeller = searchParams.get('bestSeller');
    const onSale = searchParams.get('onSale');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};

    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
        { descriptionAr: { contains: search } },
        { descriptionEn: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (featured === 'true') where.isFeatured = true;
    if (bestSeller === 'true') where.isBestSeller = true;
    if (onSale === 'true') where.isOnSale = true;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      images, // array of { url, isMain, sortOrder }
      variants, // array of { size, flavor, priceAdjustment, stock, sku }
    } = body;

    if (!nameAr || !nameEn || !price || !categoryId || !sku) {
      return NextResponse.json({ error: 'يرجى ملء جميع الحقول المطلوبة (الاسمين، السعر، القسم، ورمز SKU)' }, { status: 400 });
    }

    const baseSlug = generateSlug(nameEn);
    let slug = baseSlug;
    let count = 1;

    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const parsedPrice = parseFloat(String(price || 0)) || 0;
    const parsedOldPrice = oldPrice ? parseFloat(String(oldPrice)) || null : null;
    const parsedStock = parseInt(String(stock || 0), 10) || 0;

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

    const product = await db.product.create({
      data: {
        nameAr: String(nameAr).trim(),
        nameEn: String(nameEn).trim(),
        slug,
        descriptionAr: descriptionAr || '',
        descriptionEn: descriptionEn || '',
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        sku: String(sku).trim(),
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
    } catch (e) {}

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'فشل إنشاء المنتج' }, { status: 500 });
  }
}

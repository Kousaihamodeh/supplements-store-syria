import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { autoBackupSafe } from '@/lib/backup-helper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      governorate,
      cityArea,
      address,
      notes,
      items, // array of { productId, variantInfo, quantity }
      shippingFee,
      isDirectShippingOrder,
    } = body;

    // 1. Server-side validation of customer info
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'الاسم الكامل مطلوب' }, { status: 400 });
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 6) {
      return NextResponse.json({ error: 'رقم الهاتف / الواتساب مطلوب' }, { status: 400 });
    }

    if (!governorate || !cityArea || !address) {
      return NextResponse.json({ error: 'معلومات العنوان والمحافظة مطلوبة' }, { status: 400 });
    }

    if ((!items || !Array.isArray(items) || items.length === 0) && !isDirectShippingOrder) {
      return NextResponse.json({ error: 'سلة المشتريات فارغة' }, { status: 400 });
    }

    // 2. Validate shipping fee from database
    const dbShippingArea = await db.shippingArea.findFirst({
      where: {
        OR: [{ governorateAr: governorate }, { governorateEn: governorate }],
        isActive: true,
      },
    });

    const verifiedShippingFee = dbShippingArea ? dbShippingArea.shippingFee : 20000;

    // 3. Server-side re-fetching and price calculation (DO NOT trust client prices)
    const verifiedItems: {
      productId: string | null;
      productNameAr: string;
      productNameEn: string;
      variantInfo: string | null;
      price: number;
      quantity: number;
    }[] = [];

    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId) continue;

      const dbProduct = await db.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!dbProduct || !dbProduct.isActive) {
        return NextResponse.json({ error: `المنتج غير متوفر حالياً` }, { status: 400 });
      }

      const requestedQty = Math.max(1, parseInt(item.quantity || 1));
      if (dbProduct.stock < requestedQty) {
        return NextResponse.json(
          { error: `الكمية المطلوبة غير متوفرة من ${dbProduct.nameAr}. المتبقي: ${dbProduct.stock}` },
          { status: 400 }
        );
      }

      // Check variant price adjustment
      let variantAdjustment = 0;
      if (item.variantInfo && dbProduct.variants.length > 0) {
        const foundVariant = dbProduct.variants.find(
          (v) =>
            (v.size && item.variantInfo.includes(v.size)) ||
            (v.flavor && item.variantInfo.includes(v.flavor))
        );
        if (foundVariant) {
          variantAdjustment = foundVariant.priceAdjustment;
        }
      }

      const verifiedPrice = dbProduct.price + variantAdjustment;
      const itemSubtotal = verifiedPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;

      verifiedItems.push({
        productId: dbProduct.id,
        productNameAr: dbProduct.nameAr,
        productNameEn: dbProduct.nameEn,
        variantInfo: item.variantInfo || null,
        price: verifiedPrice,
        quantity: requestedQty,
      });
    }

    if (verifiedItems.length === 0 && !isDirectShippingOrder) {
      return NextResponse.json({ error: 'لم يتم العثور على منتجات صالحة في الطلب' }, { status: 400 });
    }

    const calculatedTotal = calculatedSubtotal + verifiedShippingFee;
    const orderNumber = `SUP-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Atomic database write & inventory decrement inside single transaction
    const order = await db.$transaction(
      async (tx) => {
        // Atomically decrement stock first using WHERE stock >= quantity to prevent race conditions & read-to-write deadlocks
        for (const vi of verifiedItems) {
          if (vi.productId) {
            const updated = await tx.product.updateMany({
              where: {
                id: vi.productId,
                stock: { gte: vi.quantity },
              },
              data: {
                stock: { decrement: vi.quantity },
              },
            });

            if (updated.count === 0) {
              throw new Error(`INSUFFICIENT_STOCK:${vi.productNameAr}`);
            }
          }
        }

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            governorate,
            cityArea,
            address,
            notes: notes ? String(notes).slice(0, 500) : '',
            subtotal: calculatedSubtotal,
            shippingFee: verifiedShippingFee,
            total: calculatedTotal,
            status: 'NEW',
            items: {
              create: verifiedItems.map((vi) => ({
                productId: vi.productId,
                productNameAr: vi.productNameAr,
                productNameEn: vi.productNameEn,
                variantInfo: vi.variantInfo,
                price: vi.price,
                quantity: vi.quantity,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        return createdOrder;
      },
      { maxWait: 15000, timeout: 15000 }
    );

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);

    if (error?.message?.startsWith('INSUFFICIENT_STOCK:')) {
      const prodName = error.message.split('INSUFFICIENT_STOCK:')[1];
      return NextResponse.json({ error: `نعتذر، النفاد المستجد للمخزون أو كمية غير كافية من ${prodName}` }, { status: 400 });
    }

    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
  }
}

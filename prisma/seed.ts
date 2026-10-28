import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SUPPLEMENTS STORE database...');

  // 1. Initialize Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeNameAr: 'متجر المكملات الغذائية',
      storeNameEn: 'SUPPLEMENTS STORE',
      phone: '0938229497',
      whatsapp: '0938229497',
      instagram: '@supplement_store_syria',
      addressAr: 'دمشق – جرمانا – ساحة الكرامة – مقابل MTN',
      addressEn: 'Damascus – Jaramana – Al-Karama Square – opposite MTN',
      googleMapsUrl: 'https://maps.google.com/?q=33.488506,36.340218',
      latitude: 33.488506,
      longitude: 36.340218,
      heroTitleAr: 'كل ما تحتاجه لأداء أقوى',
      heroTitleEn: 'Fuel Your Performance.',
      heroSubtitleAr: 'أحدث المكملات الغذائية الرياضية العالمية الأصلية 100% مع توصيل لكافة المحافظات السورية',
      heroSubtitleEn: '100% Authentic premium sports nutrition shipped right to your doorstep across Syria',
      heroImage: '/images/hero-banner.jpg',
      currencyAr: 'ل.س',
      currencyEn: 'SYP',
    },
  });

  // 2. Initialize Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@supplementstore.sy' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@supplementstore.sy',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 3. Initialize Syrian Shipping Governorates (Never overwrite existing fees)
  const shippingAreas = [
    { governorateAr: 'دمشق', governorateEn: 'Damascus', shippingFee: 15000 },
    { governorateAr: 'ريف دمشق', governorateEn: 'Rural Damascus', shippingFee: 20000 },
    { governorateAr: 'حلب', governorateEn: 'Aleppo', shippingFee: 30000 },
    { governorateAr: 'حمص', governorateEn: 'Homs', shippingFee: 25000 },
    { governorateAr: 'حماة', governorateEn: 'Hama', shippingFee: 25000 },
    { governorateAr: 'اللاذقية', governorateEn: 'Latakia', shippingFee: 30000 },
    { governorateAr: 'طرطوس', governorateEn: 'Tartous', shippingFee: 30000 },
    { governorateAr: 'درعا', governorateEn: 'Daraa', shippingFee: 25000 },
    { governorateAr: 'السويداء', governorateEn: 'As-Suwayda', shippingFee: 25000 },
    { governorateAr: 'الحسكة', governorateEn: 'Al-Hasakah', shippingFee: 35000 },
    { governorateAr: 'دير الزور', governorateEn: 'Deir ez-Zor', shippingFee: 35000 },
  ];

  for (const area of shippingAreas) {
    await prisma.shippingArea.upsert({
      where: { governorateAr: area.governorateAr },
      update: {},
      create: area,
    });
  }

  // Protect existing store data: If categories or products already exist, never overwrite or seed demo data
  const existingCategoryCount = await prisma.category.count();
  const existingProductCount = await prisma.product.count();
  if (existingCategoryCount > 0 || existingProductCount > 0) {
    console.log(
      `Database already contains ${existingCategoryCount} categories and ${existingProductCount} products. Skipping sample seed to protect existing data.`
    );
    return;
  }

  // 4. Initialize Categories
  const categoriesData = [
    {
      nameAr: 'واي بروتين',
      nameEn: 'Whey Protein',
      slug: 'whey-protein',
      descriptionAr: 'بروتين مصب اللبن النقي لدعم بناء العضلات والاستشفاء السريع',
      descriptionEn: 'Pure whey protein isolate & concentrate for rapid muscle recovery',
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80',
      sortOrder: 1,
    },
    {
      nameAr: 'كرياتين',
      nameEn: 'Creatine',
      slug: 'creatine',
      descriptionAr: 'كرياتين مونوهيدرات النقي لزيادة القوة والحجم العضلي',
      descriptionEn: 'Pure micronized creatine monohydrate for maximum power & strength',
      image: 'https://images.unsplash.com/photo-1593095940071-00427490079c?w=600&auto=format&fit=crop&q=80',
      sortOrder: 2,
    },
    {
      nameAr: 'ماس جينر',
      nameEn: 'Mass Gainer',
      slug: 'mass-gainer',
      descriptionAr: 'مكملات زيادة الوزن والكتلة العضلية بمستويات سعرات حرارية عالية',
      descriptionEn: 'High-calorie mass builders designed for fast muscle weight gain',
      image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80',
      sortOrder: 3,
    },
    {
      nameAr: 'قبل التمرين (Pre-Workout)',
      nameEn: 'Pre-Workout',
      slug: 'pre-workout',
      descriptionAr: 'مكملات طاقة وضخ دم فائق قبل التمرين لزيادة النشاط والتركيز',
      descriptionEn: 'High-energy explosive pre-workout formulas for intense focus & pump',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      sortOrder: 4,
    },
    {
      nameAr: 'أحماض أمينية (BCAA)',
      nameEn: 'Amino Acids (BCAA)',
      slug: 'amino-acids',
      descriptionAr: 'الأحماض الأمينية الأساسية للحفاظ على الكتلة العضلية أثناء التمرين',
      descriptionEn: 'Essential & branched-chain amino acids for intra-workout endurance',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      sortOrder: 5,
    },
    {
      nameAr: 'جلوتامين',
      nameEn: 'Glutamine',
      slug: 'glutamine',
      descriptionAr: 'دعم جهاز المناعة والتعافي العضلي وحماية الألياف العضلية',
      descriptionEn: 'Glutamine powder to boost gut health & muscle cell recovery',
      image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&auto=format&fit=crop&q=80',
      sortOrder: 6,
    },
    {
      nameAr: 'فيتامينات ومعادن',
      nameEn: 'Vitamins & Minerals',
      slug: 'vitamins',
      descriptionAr: 'فيتامينات متعددة ومعادن أساسية للصحة العامة والأداء الرياضي',
      descriptionEn: 'Complete daily vitamins and minerals tailored for athletes',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
      sortOrder: 7,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 5. Initialize Brands
  const brandsData = [
    { nameAr: 'أوبتيموم نيوترشن', nameEn: 'Optimum Nutrition', slug: 'optimum-nutrition' },
    { nameAr: 'ماسل تيك', nameEn: 'MuscleTech', slug: 'muscletech' },
    { nameAr: 'دايماتايز', nameEn: 'Dymatize', slug: 'dymatize' },
    { nameAr: 'سيلوكور', nameEn: 'Cellucor', slug: 'cellucor' },
    { nameAr: 'كيفن ليفرون', nameEn: 'Kevin Levrone', slug: 'kevin-levrone' },
    { nameAr: 'أبلايد نيوترشن', nameEn: 'Applied Nutrition', slug: 'applied-nutrition' },
  ];

  const brandMap = new Map<string, string>();
  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
    brandMap.set(brand.slug, created.id);
  }

  // 6. Initialize Sample Products (Only if database has NO products)
  const currentProductCount = await prisma.product.count();
  if (currentProductCount > 0) {
    console.log('Database already has products. Skipping demo sample products.');
    return;
  }

  const sampleProducts = [
    {
      nameAr: 'جولد ستاندرد 100% واي بروتين (عينة تجريبية)',
      nameEn: 'Gold Standard 100% Whey Protein (Demo Sample)',
      slug: 'gold-standard-100-whey',
      descriptionAr: 'البروتين الأكثر مبيعا عالمياً، يحتوي على 24 جرام بروتين عالي الجودة لكل جرعة مع 5.5 جرام BCAA لبناء العضلات والصيانة. (بيانات تجريبية قابلة للتعديل من لوحة التحكم)',
      descriptionEn: 'The world\'s best-selling whey protein. Packs 24g of premium whey protein per serving with 5.5g of naturally occurring BCAAs. (Demo data easy to edit in Admin)',
      price: 850000,
      oldPrice: 920000,
      sku: 'ON-WHEY-GS-5LBS',
      stock: 15,
      isFeatured: true,
      isBestSeller: true,
      isNew: true,
      isOnSale: true,
      categoryId: categoryMap.get('whey-protein')!,
      brandId: brandMap.get('optimum-nutrition')!,
      images: [
        { url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80', isMain: true, sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80', isMain: false, sortOrder: 1 },
      ],
      variants: [
        { size: '5 lbs (2.27 kg)', flavor: 'Double Rich Chocolate', priceAdjustment: 0, stock: 8, sku: 'ON-WHEY-CHOC' },
        { size: '5 lbs (2.27 kg)', flavor: 'Vanilla Ice Cream', priceAdjustment: 0, stock: 7, sku: 'ON-WHEY-VAN' },
      ],
    },
    {
      nameAr: 'بلاتينوم 100% كرياتين مونوهيدرات (عينة تجريبية)',
      nameEn: 'Platinum 100% Creatine Monohydrate (Demo Sample)',
      slug: 'platinum-100-creatine',
      descriptionAr: 'كرياتين ميكرونايزد نقياً بدون إضافات لزيادة الطاقة والقوة الانفجارية أثناء التمارين الشاقة.',
      descriptionEn: 'Pure micronized creatine monohydrate to fuel your muscles during high-intensity training.',
      price: 320000,
      oldPrice: 350000,
      sku: 'MT-CREATINE-400G',
      stock: 25,
      isFeatured: true,
      isBestSeller: true,
      isNew: false,
      isOnSale: true,
      categoryId: categoryMap.get('creatine')!,
      brandId: brandMap.get('muscletech')!,
      images: [
        { url: 'https://images.unsplash.com/photo-1593095940071-00427490079c?w=800&auto=format&fit=crop&q=80', isMain: true, sortOrder: 0 },
      ],
      variants: [
        { size: '400g (80 servings)', flavor: 'Unflavored', priceAdjustment: 0, stock: 25, sku: 'MT-CREATINE-UNF' },
      ],
    },
    {
      nameAr: 'سي 4 أوريجينال قبل التمرين (عينة تجريبية)',
      nameEn: 'C4 Original Pre-Workout (Demo Sample)',
      slug: 'c4-original-pre-workout',
      descriptionAr: 'مكمل طاقة وبامب أسطوري يعطيك تركيزاً ونشاطاً استثنائياً للتمارين الصعبة.',
      descriptionEn: 'Explosive energy and heightened focus designed to help you push past your limits.',
      price: 410000,
      oldPrice: 450000,
      sku: 'CELL-C4-30SERV',
      stock: 12,
      isFeatured: true,
      isBestSeller: false,
      isNew: true,
      isOnSale: false,
      categoryId: categoryMap.get('pre-workout')!,
      brandId: brandMap.get('cellucor')!,
      images: [
        { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', isMain: true, sortOrder: 0 },
      ],
      variants: [
        { size: '30 Servings', flavor: 'Fruit Punch', priceAdjustment: 0, stock: 6, sku: 'C4-FP' },
        { size: '30 Servings', flavor: 'Blue Razz', priceAdjustment: 0, stock: 6, sku: 'C4-BR' },
      ],
    },
    {
      nameAr: 'سيرياس ماس جينر (عينة تجريبية)',
      nameEn: 'Serious Mass Gainer (Demo Sample)',
      slug: 'serious-mass-gainer',
      descriptionAr: 'المكمل المثالي لزيادة الوزن والضخامة العضلية، يحتوي 1250 سعرة حرارية و 50 جرام بروتين لكل حصة.',
      descriptionEn: 'High-calorie weight gain powder loaded with 1,250 calories and 50g protein per serving.',
      price: 980000,
      oldPrice: 1050000,
      sku: 'ON-SERIOUS-MASS-12LBS',
      stock: 8,
      isFeatured: false,
      isBestSeller: true,
      isNew: false,
      isOnSale: true,
      categoryId: categoryMap.get('mass-gainer')!,
      brandId: brandMap.get('optimum-nutrition')!,
      images: [
        { url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80', isMain: true, sortOrder: 0 },
      ],
      variants: [
        { size: '12 lbs (5.44 kg)', flavor: 'Chocolate', priceAdjustment: 0, stock: 8, sku: 'ON-SM-CHOC' },
      ],
    },
  ];

  for (const prod of sampleProducts) {
    const { images, variants, ...prodFields } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: prodFields.slug } });
    
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...prodFields,
          images: {
            create: images,
          },
          variants: {
            create: variants,
          },
        },
      });
      console.log(`Created product: ${created.nameEn}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

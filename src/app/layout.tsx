import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { WhatsAppButton } from '@/components/store/WhatsAppButton';
import { MobileBottomBar } from '@/components/store/MobileBottomBar';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'SUPPLEMENTS STORE | متجر المكملات الغذائية - دمشق سوريا',
  description: 'المتجر الأول في سوريا للمكملات الغذائية الرياضية العالمية الأصلية 100%. شحن لجميع المحافظات السورية. 0938229497',
  keywords: ['مكملات غذائية', 'بروتين', 'كرياتين', 'دمشق', 'سوريا', 'Supplements Store Syria', 'Whey Protein Damascus'],
  openGraph: {
    title: 'SUPPLEMENTS STORE | متجر المكملات الغذائية',
    description: '100% Authentic sports supplements in Damascus, Syria.',
    images: ['/images/logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="bg-dark-950 text-white min-h-screen flex flex-col font-sans antialiased selection:bg-neon selection:text-dark-950 overflow-x-hidden">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
            <WhatsAppButton />
            <MobileBottomBar />
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export interface CartItem {
  cartItemId: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
  size?: string;
  flavor?: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: {
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    image: string;
    size?: string;
    flavor?: string;
    stock: number;
  }, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastProduct, setToastProduct] = useState<{ nameAr: string; nameEn: string; image: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product: {
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    image: string;
    size?: string;
    flavor?: string;
    stock: number;
  }, quantity = 1) => {
    const cartItemId = `${product.id}-${product.size || ''}-${product.flavor || ''}`;
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: product.price,
          image: product.image,
          size: product.size,
          flavor: product.flavor,
          quantity,
          stock: product.stock,
        },
      ];
    });

    setToastProduct({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      image: product.image,
    });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastProduct(null);
    }, 3000);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}

      {/* Add-to-Cart Toast Notification */}
      {toastProduct && (
        <div className="fixed bottom-24 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:ltr:left-6 sm:rtl:right-6 z-50 max-w-sm mx-auto sm:mx-0 bg-dark-900/95 backdrop-blur-md border border-neon/60 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-neon/15 border border-neon/40 flex items-center justify-center text-neon shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-neon leading-tight">
                {locale === 'ar' ? 'تمت الإضافة إلى السلة بنجاح ✓' : 'Added to cart successfully ✓'}
              </p>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {locale === 'ar' ? toastProduct.nameAr : toastProduct.nameEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setToastProduct(null);
                setIsCartOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-neon text-dark-950 font-extrabold text-xs hover:bg-neon-bright transition-colors flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'عرض السلة' : 'View Cart'}</span>
            </button>
            <button
              onClick={() => setToastProduct(null)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

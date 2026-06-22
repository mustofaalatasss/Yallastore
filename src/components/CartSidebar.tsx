"use client";

import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function CartSidebar() {
  const { items, isSidebarOpen, closeSidebar, removeItem, updateQuantity, openCheckout } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  };

  const formatPrice = (priceNum: number) => {
    return `Rp ${priceNum.toLocaleString("id-ID")}`;
  };

  const totalAmount = items.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0);

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 dark:bg-black/60 bg-white/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] dark:bg-[#0a0a0a] bg-gray-50 border-l dark:border-white/10 border-black/10 z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)]",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-white/10 border-black/10">
          <h2 className="text-xl font-serif dark:text-white text-gray-900 uppercase tracking-widest">Your Cart</h2>
          <button onClick={closeSidebar} className="dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full dark:text-silver text-gray-600">
              <span className="text-sm font-sans uppercase tracking-widest">Cart is empty</span>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-20 h-24 dark:bg-[#111] bg-gray-100 rounded-lg border dark:border-white/5 border-black/5 overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-serif dark:text-white text-gray-900 leading-tight mb-1 line-clamp-1">{item.name}</h3>
                  <div className="text-[10px] dark:text-silver text-gray-600 font-sans mb-2 uppercase tracking-wider space-x-2">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gold font-sans font-medium text-sm">{item.price}</span>
                    <div className="flex items-center gap-3 border dark:border-white/10 border-black/10 rounded px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="dark:text-silver text-gray-600 hover:dark:text-white text-gray-900"
                      ><Minus size={12} /></button>
                      <span className="dark:text-white text-gray-900 text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="dark:text-silver text-gray-600 hover:dark:text-white text-gray-900"
                      ><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="dark:text-white text-gray-900/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t dark:border-white/10 border-black/10 dark:bg-[#111] bg-gray-100">
            <div className="flex justify-between items-center mb-6 dark:text-white text-gray-900 font-sans uppercase tracking-widest text-sm">
              <span className="dark:text-silver text-gray-600 font-sans text-sm">Total</span>
              <span className="text-gold font-bold">{formatPrice(totalAmount)}</span>
            </div>
            <button 
              onClick={openCheckout}
              className="w-full bg-primary hover:bg-white text-black py-4 font-sans uppercase tracking-widest text-sm font-bold transition-colors shadow-[0_0_20px_rgba(230,0,0,0.2)]"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}


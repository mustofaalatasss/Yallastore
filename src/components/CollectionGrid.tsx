"use client";

import Image from "next/image";
import { ShoppingCart, Eye, Star } from "lucide-react";
import { useState, useEffect } from "react";
import QuickViewModal, { Product } from "./QuickViewModal";
import { getBadgeColor } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";

interface CollectionGridProps {
  products: any[];
  title: string;
}

export default function CollectionGrid({ products, title }: CollectionGridProps) {
  const { addItem } = useCartStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center border dark:border-white/10 border-black/10 dark:bg-[#0a0a0a] bg-gray-50 rounded-lg">
        <p className="dark:text-silver text-gray-600 font-sans">No products found in this collection yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((productData, index) => {
          const product: Product = {
            id: productData.id,
            name: productData.name,
            category: productData.category?.name || title,
            price: `Rp ${productData.price.toLocaleString('id-ID')}`,
            rating: productData.rating || 5.0,
            image: productData.image,
            variants: productData.variants,
            description: productData.description
          };

          return (
            <div 
              key={index} 
              className="group flex flex-col cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative w-full aspect-square dark:bg-[#111] bg-gray-100 overflow-hidden mb-6 border dark:border-white/5 border-black/5 group-hover:border-primary/30 transition-colors duration-500 rounded-lg">
                {productData.badge && (
                  <div className={`absolute top-4 left-4 z-10 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm ${getBadgeColor(productData.badge)}`}>
                    {productData.badge}
                  </div>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2 backdrop-blur-[2px]">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({ 
                        productId: product.id as number,
                        name: product.name, 
                        price: productData.price?.toString() || "0", 
                        image: product.image, 
                        quantity: 1, 
                        size: "L", 
                        color: product.variants?.[0]?.colorName || "Hitam" 
                      });
                    }}
                    className="w-full bg-white text-black py-3 font-sans uppercase tracking-widest text-xs hover:bg-primary transition-colors flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300 shadow-xl rounded"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="w-full dark:bg-black/80 bg-white/80 dark:text-white text-gray-900 py-3 border dark:border-white/20 border-black/20 font-sans uppercase tracking-widest text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-500 delay-75 rounded"
                  >
                    <Eye size={16} /> Quick View
                  </button>
                </div>
              </div>

              <div className="flex flex-col flex-grow px-2">
                <span className="text-[10px] uppercase tracking-widest dark:text-silver text-gray-600 mb-2">{title}</span>
                <h3 className="text-lg font-serif dark:text-white text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-white/10 border-black/10">
                  <span className="text-gold font-sans font-medium tracking-wide">{product.price}</span>
                  <div className="flex items-center gap-1 dark:text-silver text-gray-600 text-xs">
                    <Star size={12} className="fill-gold text-gold" />
                    {product.rating}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <QuickViewModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
}


"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Star, ShoppingCart, Eye } from "lucide-react";
import QuickViewModal, { Product } from "./QuickViewModal";
import { useCartStore } from "@/store/useCartStore";

export default function ProductShowcase({ products = [] }: { products?: any[] }) {
  const { addItem } = useCartStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section id="new-arrival" className="py-24 bg-[#0a0a0a]" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Latest Arrival</h2>
            <div className="w-16 h-1 bg-primary"></div>
          </div>
          <button className="text-silver hover:text-white border-b border-transparent hover:border-white transition-all uppercase tracking-widest text-xs pb-1">
            View All Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="group flex flex-col cursor-pointer"
              onClick={() => setSelectedProduct({
                id: product.id,
                name: product.name,
                category: product.category?.name || "Uncategorized",
                price: `Rp ${product.price.toLocaleString('id-ID')}`,
                rating: product.rating || 5.0,
                image: product.image,
                variants: product.variants,
                description: product.description
              })}
            >
              <div className="relative w-full aspect-square bg-[#111] overflow-hidden mb-6 border border-white/5 group-hover:border-white/20 transition-colors duration-500">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({ 
                        productId: product.id,
                        name: product.name, 
                        price: product.price?.toString() || "0", 
                        image: product.image, 
                        quantity: 1, 
                        size: "L", 
                        color: product.variants?.[0]?.colorName || "Hitam" 
                      });
                    }}
                    className="w-full bg-white text-black py-3 font-sans uppercase tracking-widest text-xs hover:bg-primary transition-colors flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct({
                        id: product.id,
                        name: product.name,
                        category: product.category?.name || "Uncategorized",
                        price: `Rp ${product.price.toLocaleString('id-ID')}`,
                        rating: product.rating || 5.0,
                        image: product.image,
                        variants: product.variants,
                        description: product.description
                      });
                    }}
                    className="w-full bg-black/80 text-white py-3 border border-white/20 font-sans uppercase tracking-widest text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-500 delay-75"
                  >
                    <Eye size={16} /> Quick View
                  </button>
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                  <span className="text-silver text-xs font-sans tracking-widest uppercase mb-2 block">{product.category?.name || "Uncategorized"}</span>
                  <h3 className="text-white font-serif text-xl mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                    <span className="text-white font-mono">Rp {product.price.toLocaleString('id-ID')}</span>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-sans">{product.rating || 5.0}</span>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
}


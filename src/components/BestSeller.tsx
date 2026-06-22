"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getBadgeColor } from "@/lib/utils";

export default function BestSeller({ products = [] }: { products?: any[] }) {
  const { addItem } = useCartStore();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section id="best-seller" className="py-24 bg-black overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif dark:text-white text-gray-900 mb-4">Best Sellers</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
          <p className="dark:text-silver text-gray-600 mt-6 font-sans tracking-wide">Our most coveted pieces. Highly demanded by the community.</p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="pb-16 !px-4"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="group relative dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-500">
                {/* Sale Badge */}
                {product.badge && (
                  <div className={`absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm ${getBadgeColor(product.badge)}`}>
                    {product.badge}
                  </div>
                )}

                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] dark:bg-[#111] bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => {
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price?.toString() || "0",
                          image: product.image,
                          size: "L",
                          color: "Hitam",
                          quantity: 1
                        });
                      }}
                      className="bg-white text-black px-6 py-3 rounded-full font-sans font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest dark:text-silver text-gray-600">{product.category?.name || "Uncategorized"}</span>
                    <div className="flex items-center gap-1 text-gold">
                      <Star size={10} className="fill-gold" />
                      <span className="text-[10px] font-sans">{product.rating || 5.0}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-serif dark:text-white text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-white/10 border-black/10">
                    <span className="text-gold font-sans font-medium tracking-wide">Rp {product.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: var(--color-silver) !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background-color: var(--color-gold) !important;
          opacity: 1;
        }
        .swiper-button-next, .swiper-button-prev {
          color: var(--color-gold) !important;
          background: rgba(0,0,0,0.5);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(4px);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 16px !important;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: var(--color-gold);
          color: #000 !important;
          border-color: var(--color-gold);
        }
      `}</style>
    </section>
  );
}


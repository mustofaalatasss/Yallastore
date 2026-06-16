"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "Demon Slayer",
    slug: "demon-slayer",
    image: "/assets/Demon Slayer.png",
    bgColor: "bg-[#140000]",
  },
  {
    name: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    image: "/assets/jujutsu kaisen - toji.webp",
    bgColor: "bg-[#0a0012]",
  },
  {
    name: "Naruto",
    slug: "naruto",
    image: "/assets/Naruto Kurama.png",
    bgColor: "bg-[#0d0400]",
  },
  {
    name: "One Piece",
    slug: "one-piece",
    image: "/assets/Zoro - One Piece.webp",
    bgColor: "bg-[#000a12]",
    imageClass: "scale-[0.75] md:scale-[0.80] group-hover:scale-[0.85] md:group-hover:scale-[0.90] origin-bottom",
  }
];

export default function FeaturedCategories() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <section id="collection" className="py-24 bg-[#050505]" ref={containerRef}>
      <div className="container mx-auto px-6 md:px-12 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Featured Collections</h2>
        <div className="w-16 h-1 bg-primary mx-auto"></div>
      </div>

      <div className="w-full h-[60vh] md:h-[80vh] flex overflow-hidden border-y border-white/10 group/container">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/collection/${cat.slug}`}
            className="group relative flex-1 hover:flex-[2] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer border-r border-white/5 last:border-r-0 bg-black overflow-hidden flex items-end justify-center pb-12"
          >
            {/* Background Glow */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700", cat.bgColor)}></div>
            
            {/* Character Image */}
            <div className="absolute inset-0 w-full h-full grayscale-[100%] brightness-[0.6] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 flex items-end justify-center">
              <div className="relative w-full h-[90%] md:h-[95%]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className={cn(
                    "object-contain object-bottom transition-transform duration-700 ease-out",
                    cat.imageClass || "scale-100 group-hover:scale-105 origin-bottom"
                  )}
                />
              </div>
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 pointer-events-none">
              <h3 className="text-2xl md:text-4xl font-serif text-white uppercase tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-bold text-center px-4">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

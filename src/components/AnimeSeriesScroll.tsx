"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Swiper imports removed as we are using a custom video cycle now

const seriesData = [
  {
    id: "naruto",
    name: "Naruto",
    tagline: "The Will of Fire",
    video: "/assets/fight scene (1).webm",
    bgOverlay: "from-[#0d0400]/90 to-transparent",
    accent: "text-[#ff7b00]",
    glow: "shadow-[0_0_50px_rgba(255,123,0,0.5)]",
    borderGlow: "border-[#ff7b00]/30",
    products: [
      { name: "Kurama Mode Oversized", image: "/assets/Katalog Produk naruto/IMG_4622.webp", availableColors: ["Hitam", "Putih", "Orange"] },
      { name: "Hokage Will Edition", image: "/assets/Katalog Produk naruto/IMG_4606.webp" },
      { name: "Shadow Clone Vintage", image: "/assets/Katalog Produk naruto/IMG_4627.webp" },
      { name: "Akatsuki Cloud Tee", image: "/assets/Katalog Produk naruto/IMG_4630.webp" },
    ]
  },
  {
    id: "onepiece",
    name: "One Piece",
    tagline: "Romance Dawn",
    video: "/assets/Fight scene (2).webm",
    bgOverlay: "from-[#000a12]/90 to-transparent",
    accent: "text-[#00a8ff]",
    glow: "shadow-[0_0_50px_rgba(0,168,255,0.5)]",
    borderGlow: "border-[#00a8ff]/30",
    products: [
      { name: "Straw Hat Crew Vintage", image: "/assets/Katalog Product One Piece/IMG_4647.webp" },
      { name: "Pirate King Legacy", image: "/assets/Katalog Product One Piece/IMG_4635.webp" },
      { name: "Grand Line Explorer", image: "/assets/Katalog Product One Piece/IMG_4649.webp" },
      { name: "Yonko Territory Tee", image: "/assets/Katalog Product One Piece/IMG_4663.webp" },
    ]
  },
  {
    id: "jjk",
    name: "Jujutsu Kaisen",
    tagline: "Domain Expansion",
    video: "/assets/Fight scene (3).webm",
    bgOverlay: "from-[#0a0012]/90 to-transparent",
    accent: "text-[#8a2be2]",
    glow: "shadow-[0_0_50px_rgba(138,43,226,0.5)]",
    borderGlow: "border-[#8a2be2]/30",
    products: [
      { name: "Special Grade Curse Tee", image: "/assets/Katalog Produk jujutsu kaijen/IMG_4710.webp" },
      { name: "Limitless Void Edition", image: "/assets/Katalog Produk jujutsu kaijen/IMG_4677.webp" },
      { name: "Cursed Energy Oversized", image: "/assets/Katalog Produk jujutsu kaijen/IMG_4717.webp" },
      { name: "Sorcerer Elite Series", image: "/assets/Katalog Produk jujutsu kaijen/IMG_4721.webp" },
    ]
  },
  {
    id: "ds",
    name: "Demon Slayer",
    tagline: "Total Concentration",
    video: "/assets/fight scene (1).webm",
    bgOverlay: "from-[#140000]/90 to-transparent",
    accent: "text-[#ff3838]",
    glow: "shadow-[0_0_50px_rgba(255,56,56,0.5)]",
    borderGlow: "border-[#ff3838]/30",
    products: [
      { name: "Hinokami Kagura Edition", image: "/assets/Katalaog Produk demon Slayer/IMG_4748.webp" },
      { name: "Hashira Pillar Tee", image: "/assets/Katalaog Produk demon Slayer/IMG_4723.webp" },
      { name: "Water Breathing Vintage", image: "/assets/Katalaog Produk demon Slayer/IMG_4737.webp" },
      { name: "Demon Blood Art Series", image: "/assets/Katalaog Produk demon Slayer/IMG_4764.webp" },
    ]
  },
];

function ProductShowcase({ series }: { series: typeof seriesData[0] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % series.products.length);
    }, 2500); // Change product every 2.5 seconds
    
    return () => clearInterval(timer);
  }, [series.products.length]);

  return (
    <>
      {/* Text Content - Glassmorphism Card */}
      <div className={cn(
        "flex flex-col items-start space-y-6 bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border",
        series.borderGlow
      )}>
        <span className={cn("text-xs md:text-sm uppercase tracking-[0.3em] font-bold drop-shadow-md", series.accent)}>
          {series.tagline}
        </span>
        <h3 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-none drop-shadow-2xl">
          {series.name}
        </h3>
        <div className="h-[1px] w-full bg-white/20 my-4"></div>
        
        <div className="w-full min-h-[80px]">
          <p className="text-gray-300 font-sans text-base md:text-lg mb-1">
            Featured Collection ({currentIndex + 1}/{series.products.length}):
          </p>
          <div className="relative h-8 w-full">
            {series.products.map((product, index) => (
              <span 
                key={product.name} 
                className={cn(
                  "text-white font-bold text-xl md:text-2xl block absolute inset-0 transition-all duration-500",
                  index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                )}
              >
                {product.name}
              </span>
            ))}
          </div>
        </div>

        <button className={cn(
          "px-8 py-4 bg-white/10 backdrop-blur-sm border transition-all duration-500 font-sans uppercase tracking-[0.2em] text-xs md:text-sm mt-6 font-bold",
          "hover:bg-white hover:text-black hover:scale-105",
          series.borderGlow,
          series.glow
        )}>
          Shop {series.name} Collection
        </button>
      </div>

      {/* Image Content */}
      <div className="relative h-[40vh] md:h-[65vh] w-full flex justify-center items-center group">
        <div className={cn("absolute inset-0 rounded-full opacity-15 blur-[120px] transition-all duration-1000 group-hover:opacity-30 group-hover:scale-105", series.glow)}></div>
        
        {/* Animated Image Switcher */}
        <div className="relative w-full h-full flex justify-center items-center z-10">
          {series.products.map((product, index) => (
            <Image
              key={product.image}
              src={product.image}
              alt={product.name}
              width={600}
              height={800}
              unoptimized
              style={{ width: 'auto' }}
              className={cn(
                "object-contain h-full absolute transition-all duration-700 ease-in-out drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] brightness-[0.85] group-hover:brightness-100 group-hover:scale-105",
                index === currentIndex 
                  ? "opacity-60 group-hover:opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-95 translate-y-4 pointer-events-none"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function AnimeSeriesScroll() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSeries = seriesData[activeIndex];

  return (
    <section id="series" className="bg-black relative h-screen overflow-hidden">
      <div className="absolute top-24 left-6 md:left-12 z-20 pointer-events-none mix-blend-difference">
        <h2 className="text-3xl md:text-5xl font-serif text-white tracking-widest uppercase drop-shadow-lg">Anime Series</h2>
        <div className="w-16 h-1 bg-white mt-4 shadow-[0_0_10px_white]"></div>
      </div>

      {/* Background Video - Only 1 rendered at a time */}
      <video 
        key={activeSeries.id}
        autoPlay
        muted 
        playsInline
        onEnded={() => setActiveIndex((prev) => (prev + 1) % seriesData.length)}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 scale-105 animate-in fade-in duration-1000"
      >
        <source src={activeSeries.video} type="video/webm" />
      </video>

      {/* Gradient Overlay for readability and atmosphere */}
      <div className={cn(
        "absolute inset-0 z-0 bg-gradient-to-r via-black/50 transition-colors duration-1000",
        activeSeries.bgOverlay
      )}></div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 z-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none"></div>

      <div className="w-full h-full flex items-center justify-center relative px-6 md:px-20 overflow-hidden">
        {/* Use key to force re-render and re-trigger animations of text */}
        <div 
          key={`content-${activeSeries.id}`} 
          className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 pt-20 md:pt-0 animate-in slide-in-from-left-8 fade-in duration-1000"
        >
          <ProductShowcase series={activeSeries} />
        </div>
      </div>

      {/* Manual Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {seriesData.map((series, idx) => (
          <button
            key={series.id}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              idx === activeIndex ? "bg-white scale-125 shadow-[0_0_8px_white]" : "bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to ${series.name}`}
          />
        ))}
      </div>
    </section>
  );
}

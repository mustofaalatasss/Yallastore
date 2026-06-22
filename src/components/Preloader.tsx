"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";

// Menggunakan nama file yang disepakati (ditaruh di public/assets)
const characters = [
  "/assets/char1.png",
  "/assets/char2.jpeg",
  "/assets/char3.png",
  "/assets/char4.png",
];

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable scroll while loading
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        document.body.style.overflow = "auto";
      },
    });

    // Initial state: hide images and set slight zoom
    gsap.set(imageRefs.current, { opacity: 0, scale: 1.1 });

    // Flash each character quickly
    characters.forEach((_, index) => {
      // Mengurangi opacity maksimal gambar agar lebih soft (tidak terlalu terang)
      tl.set(imageRefs.current[index], { opacity: 0.6 })
        .to(imageRefs.current[index], { 
          scale: 1, 
          duration: 0.4, 
          ease: "none" // Menggunakan 'none' agar zoom terasa konsisten dan cinematic
        })
        .set(imageRefs.current[index], { opacity: 0 });
    });

    // After all characters flashed, show a quick white flash effect
    // Menurunkan opacity dari flash putih agar tidak terlalu kontras/menyilaukan
    tl.set(overlayRef.current, { opacity: 0.2 })
      .to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" })
      // Then softly fade out the entire preloader instead of sliding up
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
      }, "-=0.2");

  }, []);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Cinematic wide frame for the eyes */}
      {/* Mengganti dark:border-white/20 border-black/20 menjadi dark:border-white/5 border-black/5 agar lebih senada dengan latar */}
      <div className="relative w-full h-[40vh] md:h-[50vh] border-y dark:border-white/5 border-black/5 overflow-hidden flex items-center justify-center bg-zinc-950">
        {characters.map((src, index) => (
          <Image
            key={src}
            ref={(el) => {
              if (el) imageRefs.current[index] = el;
            }}
            src={src}
            alt={`Character Flash ${index + 1}`}
            fill
            className="object-cover opacity-0 object-[center_20%] md:object-[center_25%]"
            priority
          />
        ))}
        
        {/* Flash overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-white opacity-0 z-10"
        />
      </div>
      
      {/* Loading Logo below */}
      <div className="absolute bottom-12 flex flex-col items-center">
        <Image
          src="/assets/Loggo_Brand-removebg-preview.png"
          alt="Yalla Logo"
          width={120}
          height={60}
          className="opacity-50 animate-pulse"
          priority
        />
      </div>
    </div>
  );
}


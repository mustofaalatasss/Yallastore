"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CinematicBanner() {
  const bannerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Parallax background
    gsap.to(videoRef.current, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: bannerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    // Text entrance
    gsap.fromTo(
      textRef.current?.children || [],
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: bannerRef.current,
          start: "top 60%",
        },
      }
    );
  }, []);

  return (
    <section ref={bannerRef} className="relative w-full h-[70vh] flex items-center overflow-hidden border-y dark:border-white/10 border-black/10">
      {/* Parallax Video */}
      <div className="absolute inset-0 w-full h-[130%] -top-[15%] z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/Background animation.webm" type="video/webm" />
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r dark:from-black/90 dark:via-black/70 dark:to-black/30 from-black/50 via-black/20 to-transparent z-10 transition-colors duration-500" />

      {/* Content */}
      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div ref={textRef} className="max-w-2xl">
          <span className="inline-block text-primary uppercase tracking-[0.3em] text-sm mb-4">
            Limited Anime Drop
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight drop-shadow-lg">
            Exclusive Design.<br />
            Premium Fabric.<br />
            <span className="italic text-gray-300">Anime Identity.</span>
          </h2>
          <button className="mt-8 px-10 py-4 bg-primary text-black font-sans uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(230,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            Shop Limited Drop
          </button>
        </div>
      </div>
    </section>
  );
}


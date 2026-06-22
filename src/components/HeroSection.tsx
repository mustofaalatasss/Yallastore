"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "./MagneticButton";
import { useUIStore } from "@/store/useUIStore";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { logoAppeared, setLogoAppeared } = useUIStore();

  useEffect(() => {
    // Prevent the video from playing behind the preloader
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ delay: 1.2 }); // Sync with new faster preloader

    // Play the video exactly when the preloader starts lifting
    tl.call(() => {
      if (videoRef.current) {
        // Ensure it is at the beginning before playing
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }, [], 0);

    // Video zoom out effect
    tl.fromTo(
      videoRef.current,
      { scale: 1.2 },
      { scale: 1, duration: 2, ease: "power2.out" },
      0
    );

    // Initial state for text
    if (titleRef.current) {
      const text = titleRef.current.textContent || "";
      const words = text.trim().split(/\s+/);
      titleRef.current.innerHTML = "";
      words.forEach((word) => {
        if (!word) return;
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(50px)";
        titleRef.current?.appendChild(span);
        titleRef.current?.appendChild(document.createTextNode(" "));
      });
    }

    gsap.set(subtitleRef.current, { opacity: 0, y: 30 });
    gsap.set(ctaRef.current, { opacity: 0, y: 20 });

    // Parallax effect on scroll
    gsap.to(titleRef.current, {
      y: -150,
      opacity: 0,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(subtitleRef.current, {
      y: -100,
      opacity: 0,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

  }, []);

  useEffect(() => {
    if (logoAppeared) {
      const tl = gsap.timeline();

      if (titleRef.current && titleRef.current.children.length > 0) {
        tl.to(
          titleRef.current.children,
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          0
        );
      }

      tl.to(
        subtitleRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        (titleRef.current && titleRef.current.children.length > 0) ? "-=0.5" : 0
      );

      tl.to(
        ctaRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, [logoAppeared]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // We assume the high-five and logo appear at ~6 seconds into the video.
    // You can adjust this value to the exact timestamp (in seconds) you want!
    if (video.currentTime >= 2 && !logoAppeared) {
      setLogoAppeared(true);
    }
  };

  return (
    <section ref={heroRef} id="home" className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/assets/opening.mp4" type="video/mp4" />
      </video>

      {/* Overlay: Changed from dark:bg-black/60 bg-white/60 to bg-black/30 to make it brighter */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20">
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-7xl font-serif dark:text-white text-gray-900 mb-6 leading-tight drop-shadow-2xl animate-sweep"
        >

        </h1>
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl dark:text-silver text-gray-600 font-sans tracking-wide mb-10 max-w-2xl mx-auto drop-shadow-md"
        >
          Wear Your Favorite Anime With Style. Exclusive designs crafted for the true fans.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Buttons removed as per user request */}
        </div>
      </div>
    </section>
  );
}

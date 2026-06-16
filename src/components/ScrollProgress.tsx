"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only show on desktop for performance
    if (window.matchMedia("(pointer: fine)").matches) {
      setIsDesktop(true);
    } else {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.to(progressRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3, // slight delay for smooth feel
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] z-[9999] pointer-events-none">
      <div 
        ref={progressRef}
        className="w-full h-full bg-primary shadow-[0_0_10px_#E60000]"
        style={{ transformOrigin: "0% 50%", transform: "scaleX(0)" }}
      />
    </div>
  );
}


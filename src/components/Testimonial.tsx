"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Rizky F.",
    role: "Streetwear Enthusiast",
    text: "Bahannya premium, desain anime-nya keren tapi tetap elegan. Enggak nyangka bisa nemu kaos anime yang se-luxury ini.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ahmad S.",
    role: "Anime Fan",
    text: "Cocok banget buat dipakai daily, bukan sekadar kaos anime biasa. Sablonannya juga kelihatan mahal.",
    rating: 5,
  },
  {
    id: 3,
    name: "Bima A.",
    role: "Verified Buyer",
    text: "Jujur, ini brand anime lokal terbaik yang pernah saya beli. Fitting oversized-nya pas banget di badan.",
    rating: 4.5,
  },
];

export default function Testimonial() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up stagger effect
    gsap.fromTo(cardsRef.current, 
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        }
      }
    );
  }, []);

  return (
    <section className="dark:bg-[#050505] bg-white relative py-24 md:py-32" ref={sectionRef}>
      {/* Subtle Noise Background */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-serif dark:text-white text-gray-900 mb-4">What They Say</h2>
          <div className="w-16 h-1 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Featured Visual Testimonial */}
          <div 
            ref={(el) => { cardsRef.current[0] = el; }}
            className="lg:col-span-5 flex flex-col group overflow-hidden rounded-xl border dark:border-white/5 border-black/5 hover:border-primary/20 transition-all duration-500 dark:bg-[#0a0a0a] bg-gray-50"
          >
             {/* Image Section (Top) */}
             <div className="w-full h-[350px] md:h-[450px] relative overflow-hidden">
               <img 
                 src="/assets/real-zoro.jpeg" 
                 alt="Customer wearing Zoro shirt" 
                 className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" 
               />
               <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 dark:bg-black/60 bg-white/60 backdrop-blur-sm border border-primary/30 rounded-full text-[10px] text-primary uppercase tracking-widest font-bold flex items-center gap-1 shadow-lg">
                   <CheckCircle size={10} /> Real Customer Pict
                 </span>
               </div>
             </div>
             
             {/* Text Section (Bottom) */}
             <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex gap-1 text-gold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-gold" />
                  ))}
                </div>
                <p className="dark:text-white text-gray-900 font-sans text-lg leading-relaxed mb-6 font-light italic">
                  "Desain Zoro-nya beneran sedetail itu aslinya! Bahannya premium dan fitting oversized-nya pas banget di badan. Definitely will buy again."
                </p>
                <div>
                  <h4 className="dark:text-white text-gray-900 font-serif text-xl">Rizky F.</h4>
                  <span className="dark:text-silver text-gray-600/60 text-xs uppercase tracking-widest mt-1 inline-block">Streetwear Enthusiast</span>
                </div>
             </div>
          </div>

          {/* Text Testimonials Grid */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {testimonials.slice(1).map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardsRef.current[index + 1] = el;
                }}
                className="w-full dark:bg-[#0a0a0a] bg-gray-50 p-8 md:p-10 border dark:border-white/5 border-black/5 hover:border-primary/20 transition-colors duration-500 relative flex-1 flex flex-col justify-center rounded-xl"
              >
                <Quote className="absolute top-6 right-6 dark:text-white text-gray-900/5" size={60} />
                <div>
                  <div className="flex gap-1 text-gold mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={cn(
                          i + 1 <= item.rating ? "fill-gold" : "fill-transparent border-gold text-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <p className="dark:text-silver text-gray-600 font-sans text-base md:text-lg leading-relaxed mb-8 relative z-10 font-light italic">
                    &quot;{item.text}&quot;
                  </p>
                </div>
                <div>
                  <h4 className="dark:text-white text-gray-900 font-serif text-xl">{item.name}</h4>
                  <span className="dark:text-silver text-gray-600/60 text-xs uppercase tracking-widest mt-1 inline-block">{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


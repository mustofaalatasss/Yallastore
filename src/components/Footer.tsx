"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 95%",
        },
      }
    );
  }, []);

  return (
    <footer id="contact" ref={footerRef} className="dark:bg-black bg-gray-50 pt-24 pb-12 border-t dark:border-white/10 border-black/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Image
              src="/assets/Loggo_Brand-removebg-preview.png"
              alt="Yalla Logo"
              width={140}
              height={70}
              className="mb-6 drop-shadow-md"
            />
            <p className="dark:text-silver text-gray-600 text-sm font-sans leading-relaxed mb-6">
              Premium anime streetwear crafted for those who want to wear their passion with elegance and style.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border dark:border-white/20 border-black/20 flex items-center justify-center dark:text-silver text-gray-600 hover:text-black hover:bg-primary hover:border-primary transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border dark:border-white/20 border-black/20 flex items-center justify-center dark:text-silver text-gray-600 hover:text-black hover:bg-primary hover:border-primary transition-all duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="dark:text-white text-gray-900 font-serif text-lg mb-6 tracking-wide">Collection</h4>
            <ul className="space-y-4">
              {["Naruto", "One Piece", "Jujutsu Kaisen", "Demon Slayer"].map((link) => (
                <li key={link}>
                  <Link href={`#${link.toLowerCase().replace(" ", "-")}`} className="dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 text-sm font-sans transition-colors relative group inline-block">
                    {link}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="dark:text-white text-gray-900 font-serif text-lg mb-6 tracking-wide">Contact</h4>
            <ul className="space-y-4 text-sm dark:text-silver text-gray-600 font-sans">
              <li>Mustofaalatasss@gmail.com</li>
              <li>Mon - Fri, 9AM - 6PM</li>
              <li>
                <a href="https://wa.me/6287868036735" className="inline-flex items-center gap-2 hover:text-primary transition-colors mt-2">
                  <MessageCircle size={16} /> WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="dark:text-white text-gray-900 font-serif text-lg mb-6 tracking-wide">Newsletter</h4>
            <p className="dark:text-silver text-gray-600 text-sm font-sans mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent border-b dark:border-white/30 border-black/30 px-0 py-3 dark:text-white text-gray-900 text-sm focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <button type="submit" className="absolute right-0 top-3 text-xs uppercase tracking-widest text-primary hover:dark:text-white text-gray-900 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t dark:border-white/10 border-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="dark:text-silver text-gray-600/60 text-xs font-sans">
            &copy; {new Date().getFullYear()} Yalla Store. All rights reserved.
          </p>
          <div className="flex gap-4 dark:text-silver text-gray-600/60 text-xs font-sans">
            <Link href="/privacy" className="hover:dark:text-white text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:dark:text-white text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


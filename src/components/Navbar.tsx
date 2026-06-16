"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import SearchModal from "./SearchModal";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Collection", href: "#collection" },
  { name: "Anime Series", href: "#series" },
  { name: "New Arrival", href: "#new-arrival" },
  { name: "Best Seller", href: "#best-seller" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, openSidebar } = useCartStore();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const logoAppeared = useUIStore((state) => state.logoAppeared);

  useEffect(() => {
    // Hide initially
    if (navRef.current) {
      gsap.set(navRef.current, { y: -100, opacity: 0 });
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    setIsMounted(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (logoAppeared && navRef.current) {
      gsap.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      });
    }
  }, [logoAppeared]);

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 w-full z-40 transition-all duration-500",
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-4 shadow-lg shadow-black/50" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="#home">
          <Image
            src="/assets/Loggo_Brand-removebg-preview.png"
            alt="Yalla Logo"
            width={120}
            height={60}
            className="cursor-pointer drop-shadow-md"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-widest font-sans text-silver">
          {navLinks.map((link) => (
            <li key={link.name} className="relative group">
              <Link href={link.href} className="hover:text-white transition-colors duration-300">
                {link.name}
              </Link>
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Icons & CTA */}
        <div className="flex items-center space-x-6">
          <button onClick={() => setIsSearchOpen(true)} className="text-silver hover:text-primary transition-colors duration-300">
            <Search size={20} />
          </button>
          <Link href="/track-order" className="text-silver hover:text-primary transition-colors duration-300" title="Track Order">
            <Package size={20} />
          </Link>
          <button onClick={openSidebar} className="text-silver hover:text-primary transition-colors duration-300 relative">
            <ShoppingCart size={20} />
            {isMounted && cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                {cartItemCount}
              </span>
            )}
          </button>
          <button className="hidden md:block px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-sans tracking-widest uppercase text-xs">
            Shop Now
          </button>
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}


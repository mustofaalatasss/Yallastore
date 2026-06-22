"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Package, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import SearchModal from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        isScrolled ? "dark:bg-black/80 bg-white/80 backdrop-blur-md border-b dark:border-white/10 border-black/10 py-4 shadow-lg shadow-black/50" : "bg-transparent py-6"
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
        <ul className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-widest font-sans dark:text-silver text-gray-600">
          {navLinks.map((link) => (
            <li key={link.name} className="relative group">
              <Link href={link.href} className="hover:dark:text-white text-gray-900 transition-colors duration-300">
                {link.name}
              </Link>
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Icons & CTA */}
        <div className="flex items-center space-x-6">
          <ThemeToggle />
          <button onClick={() => setIsSearchOpen(true)} className="dark:text-silver text-gray-600 hover:text-primary transition-colors duration-300">
            <Search size={20} />
          </button>
          <Link href="/track-order" className="dark:text-silver text-gray-600 hover:text-primary transition-colors duration-300" title="Track Order">
            <Package size={20} />
          </Link>
          <button onClick={openSidebar} className="dark:text-silver text-gray-600 hover:text-primary transition-colors duration-300 relative">
            <ShoppingCart size={20} />
            {isMounted && cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 dark:text-white text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                {cartItemCount}
              </span>
            )}
          </button>
          <button className="hidden md:block px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-sans tracking-widest uppercase text-xs">
            Shop Now
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden dark:text-silver text-gray-600 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={cn(
          "lg:hidden absolute top-full left-0 w-full dark:bg-black/95 bg-white/95 backdrop-blur-xl border-t border-primary/20 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl shadow-black",
          isMobileMenuOpen ? "max-h-[500px] py-8 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none"
        )}
      >
        <ul className="flex flex-col items-center space-y-6">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-sans uppercase tracking-widest dark:text-silver text-gray-600 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-4 md:hidden">
            <button className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-sans tracking-widest uppercase text-xs">
              Shop Now
            </button>
          </li>
        </ul>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}


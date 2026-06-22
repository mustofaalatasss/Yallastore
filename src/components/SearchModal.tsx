"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        ".search-modal-content",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/collection?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-24 px-4">
      <div 
        className="absolute inset-0 dark:bg-black/80 bg-white/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <div className="search-modal-content relative w-full max-w-3xl dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/10 border-black/10 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
        <button onClick={onClose} className="absolute top-6 right-6 dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-6">Search Collection</h2>
        
        <form onSubmit={handleSearch} className="flex items-center border-b dark:border-white/20 border-black/20 pb-4">
          <Search size={24} className="dark:text-silver text-gray-600 mr-4" />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anime, characters, or streetwear..."
            className="flex-1 bg-transparent border-none dark:text-white text-gray-900 text-xl md:text-2xl focus:outline-none placeholder:dark:text-white text-gray-900/20 font-sans"
          />
          <button type="submit" className="text-primary hover:dark:text-white text-gray-900 transition-colors font-sans uppercase tracking-widest text-sm ml-4">
            Search
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="text-xs dark:text-silver text-gray-600 uppercase tracking-widest mr-2">Popular:</span>
          {["Jujutsu Kaisen", "Demon Slayer", "Oversized Tee", "Hoodie"].map((term) => (
            <button 
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                router.push(`/collection?q=${encodeURIComponent(term)}`);
                onClose();
              }}
              className="text-xs bg-white/5 hover:bg-primary hover:text-black dark:text-silver text-gray-600 px-3 py-1 rounded transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

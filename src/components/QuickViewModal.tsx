"use client";

import { X, ShoppingCart, Star, StarHalf } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import ReviewSection from "./ReviewSection";

export interface Product {
  id?: number | string;
  name: string;
  category: string;
  price: string | number;
  rating?: number;
  image: string;
  availableColors?: string[];
  colorImages?: Record<string, string>;
  variants?: any[];
  description?: string;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  { name: "Putih", hex: "#FFFFFF" },
  { name: "Hitam", hex: "#1A1A1A" },
  { name: "Merah", hex: "#DC2626" },
  { name: "Abu-abu", hex: "#9CA3AF" },
  { name: "Abu-abu Gelap", hex: "#4B5563" },
  { name: "Ungu", hex: "#7C3AED" },
  { name: "Hijau", hex: "#059669" },
  { name: "Pink", hex: "#DB2777" },
  { name: "Biru Muda", hex: "#60A5FA" },
  { name: "Biru Tua", hex: "#1E3A8A" },
];

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [selectedColor, setSelectedColor] = useState<string>("Hitam");
  const [isClosing, setIsClosing] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const [localProduct, setLocalProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (product) {
      setLocalProduct(product);

      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].colorName);
      } else if (product.availableColors && product.availableColors.length > 0) {
        setSelectedColor(product.availableColors[0]);
      } else {
        setSelectedColor("Hitam");
      }
    } else {
      setLocalProduct(null);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // match animation duration
  };

  const sizes = ["S", "M", "L", "XL", "OVERSIZED"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-0">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-[95vw] md:w-[90vw] max-w-7xl h-[90vh] md:h-[85vh] bg-[#111] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row transition-all duration-300 transform rounded-xl",
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
        >
          <X size={20} />
        </button>

        {localProduct && (
          <>
            {/* Image Section */}
            <div className="w-full md:w-3/5 relative h-[40vh] md:h-full flex-shrink-0 bg-[#0a0a0a] group overflow-hidden cursor-zoom-in">
              {showSizeGuide ? (
                <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                  <button 
                    onClick={() => setShowSizeGuide(false)}
                    className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-30"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-white font-serif mb-4 text-xl absolute top-6 left-6 z-30">Size Guide</h3>
                  <div className="relative w-full h-full mt-8">
                    <Image src="/assets/size-guide.jpg" alt="Size Guide" fill className="object-contain" unoptimized />
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={
                      localProduct.variants?.find((v: any) => v.colorName === selectedColor)?.image 
                      || localProduct.colorImages?.[selectedColor] 
                      || localProduct.image
                    }
                    alt={localProduct.name}
                    fill
                    unoptimized
                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-125"
                  />
                  {/* Hint badge */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-sans pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    Hover to Zoom
                  </div>
                </>
              )}
            </div>

            {/* Details Section */}
            <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col bg-gradient-to-br from-[#111] to-black overflow-y-auto flex-1">
              <span className="text-xs uppercase tracking-[0.2em] text-silver mb-3 block">
                {localProduct.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
                {localProduct.name}
              </h2>
              
              <div className="flex items-end justify-between">
                <span className="text-2xl font-sans font-medium text-gold tracking-wider">
                  {localProduct.price}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>
                  {localProduct.rating && (
                    <span className="text-silver text-sm">{localProduct.rating}</span>
                  )}
                </div>
              </div>

              <div className="h-[1px] w-full bg-white/10 mb-6"></div>

              <p className="text-silver/80 font-sans text-sm leading-relaxed mb-6 whitespace-pre-line">
                {localProduct.description || `Premium quality streetwear featuring intricate ${localProduct.category} designs. Made with 100% heavy cotton for maximum comfort and durability.`}
              </p>

              {/* Color Selector */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white font-sans uppercase tracking-wider">
                    Color: <span className="text-silver">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors
                    .filter(c => {
                      if (localProduct.variants && localProduct.variants.length > 0) {
                        return localProduct.variants.some((v: any) => v.colorName === c.name);
                      }
                      const available = localProduct.availableColors && localProduct.availableColors.length > 0 
                        ? localProduct.availableColors 
                        : ["Hitam"];
                      return available.includes(c.name);
                    })
                    .map((color) => {
                      // Fetch hex from variants if it exists, else from default colors
                      const variant = localProduct.variants?.find((v: any) => v.colorName === color.name);
                      const displayHex = variant ? variant.colorHex : color.hex;

                      return (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                            selectedColor === color.name
                              ? "border border-primary scale-110"
                              : "border border-transparent hover:border-white/30"
                          )}
                        >
                          <span 
                            className="w-7 h-7 rounded-full shadow-inner border border-white/10" 
                            style={{ backgroundColor: displayHex }}
                          />
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white font-sans uppercase tracking-wider">Select Size</span>
                  <button 
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-silver hover:text-white underline underline-offset-4"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-4 py-2 text-sm font-sans uppercase tracking-widest border transition-all duration-300",
                        selectedSize === size 
                          ? "bg-white text-black border-white" 
                          : "bg-transparent text-silver border-white/20 hover:border-white hover:text-white"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={() => {
                  addItem({
                    productId: Number(localProduct.id),
                    name: localProduct.name,
                    price: typeof localProduct.price === 'string' 
                            ? localProduct.price 
                            : localProduct.price.toString(),
                    image: localProduct.variants?.find((v: any) => v.colorName === selectedColor)?.image 
                           || localProduct.colorImages?.[selectedColor] 
                           || localProduct.image,
                    quantity: 1,
                    size: selectedSize,
                    color: selectedColor
                  });
                  onClose();
                }}
                className="w-full bg-primary hover:bg-[#e6a300] text-black py-4 font-sans uppercase tracking-widest text-sm font-bold flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(230,0,0,0.2)] mb-8"
              >
                <ShoppingCart size={18} />
                Add to Cart - {localProduct.price}
              </button>

              {/* Reviews Section (Read Only in Quick View) */}
              <ReviewSection productId={localProduct.id!} readOnly={true} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}


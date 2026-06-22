"use client";

import { UploadCloud, X, ArrowLeft, Save, CheckCircle, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, use } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [colorFiles, setColorFiles] = useState<Record<string, File>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${productId}`).then(res => res.json()),
      fetch("/api/categories").then(res => res.json())
    ]).then(([productData, categoriesData]) => {
      setCategories(categoriesData);
      
      if (productData) {
        setName(productData.name || "");
        setPrice(productData.price?.toString() || "");
        setStock(productData.stock?.toString() || "");
        setCategoryId(productData.categoryId?.toString() || (categoriesData[0]?.id?.toString() || ""));
        setBadge(productData.badge || "");
        setDescription(productData.description || "");
        setImagePreview(productData.image || null);
        
        if (productData.variants) {
          const colors = productData.variants.map((v: any) => v.colorName);
          setSelectedColors(colors);
          
          const initialColorImages: Record<string, string> = {};
          productData.variants.forEach((v: any) => {
            if (v.image) {
              initialColorImages[v.colorName] = v.image;
            }
          });
          setColorImages(initialColorImages);
        }
      }
      setLoading(false);
    });
  }, [productId]);

  const handleColorImageChange = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setColorFiles(prev => ({ ...prev, [color]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setColorImages(prev => ({ ...prev, [color]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedColors.length === 0) {
      alert("Please select at least one available color.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      let imageUrl = imagePreview;
      
      // Upload new image if file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const colorMap: Record<string, string> = {
        "Putih": "#FFFFFF", "Hitam": "#1A1A1A", "Merah": "#DC2626", 
        "Abu-abu": "#9CA3AF", "Abu-abu Gelap": "#4B5563", "Ungu": "#7C3AED", 
        "Hijau": "#059669", "Pink": "#DB2777", "Biru Muda": "#60A5FA", "Biru Tua": "#1E3A8A"
      };

      const variants = await Promise.all(selectedColors.map(async (color) => {
        let variantImageUrl = colorImages[color] || null;

        if (colorFiles[color]) {
          const formData = new FormData();
          formData.append("file", colorFiles[color]);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            variantImageUrl = uploadData.url;
          }
        } else if (variantImageUrl && variantImageUrl.startsWith("data:")) {
          variantImageUrl = null;
        }

        return {
          colorName: color,
          colorHex: colorMap[color] || "#000000",
          image: variantImageUrl
        };
      }));

      // Update Product
      const productRes = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          stock,
          categoryId,
          badge,
          description,
          image: imageUrl,
          variants
        })
      });

      if (!productRes.ok) {
        const errorData = await productRes.json().catch(() => ({}));
        let errorMessage = errorData.error || "Failed to update product";
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += ": " + errorData.details.map((d: any) => d.message).join(", ");
        }
        throw new Error(errorMessage);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/products");
      }, 1500);
      
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="dark:text-white text-gray-900 py-20 text-center">Loading product...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="w-12 h-12 rounded-xl bg-white/5 border dark:border-white/10 border-black/10 flex items-center justify-center dark:text-silver text-gray-600 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(230,0,0,0.2)] hover:-translate-x-1 group">
          <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-4xl font-serif dark:text-white text-gray-900 mb-2">Edit Product</h1>
          <p className="dark:text-silver text-gray-600/80 text-sm font-sans tracking-wide">Update product details and images.</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-6 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} />
          <span className="font-sans text-sm">Product updated successfully! (Visual Mockup Mode)</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="dark:bg-[#050505] bg-white/60 backdrop-blur-xl border dark:border-white/5 border-black/5 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-50"></div>
            <h2 className="text-xl font-serif dark:text-white text-gray-900 border-b dark:border-white/5 border-black/5 pb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Basic Information
            </h2>
            
            <div className="space-y-3 group">
              <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Product Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl px-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:dark:text-silver text-gray-600/30 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Price (Rp)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 dark:text-silver text-gray-600/50 font-sans">Rp</span>
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl pl-12 pr-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono placeholder:dark:text-silver text-gray-600/30 shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-3 group">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Stock</label>
                <input 
                  type="number" 
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min={0}
                  className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl px-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono placeholder:dark:text-silver text-gray-600/30 shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Category (Anime Series)</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl px-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="dark:bg-[#111] bg-gray-100">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 group">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Badge (Optional)</label>
                <select 
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl px-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all appearance-none cursor-pointer shadow-inner uppercase"
                >
                  <option value="" className="dark:bg-[#111] bg-gray-100">No Badge</option>
                  <option value="HOT" className="dark:bg-[#111] bg-gray-100 text-red-500">HOT (Red)</option>
                  <option value="NEW" className="dark:bg-[#111] bg-gray-100 text-blue-500">NEW (Blue)</option>
                  <option value="SALE" className="dark:bg-[#111] bg-gray-100 text-yellow-500">SALE (Yellow)</option>
                  <option value="LIMITED" className="dark:bg-[#111] bg-gray-100 text-purple-500">LIMITED (Purple)</option>
                  <option value="PRE-ORDER" className="dark:bg-[#111] bg-gray-100 text-emerald-500">PRE-ORDER (Green)</option>
                  <option value="BEST SELLER" className="dark:bg-[#111] bg-gray-100 text-orange-500">BEST SELLER (Orange)</option>
                </select>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600">Available Colors</label>
              <div className="flex flex-wrap gap-3">
                {[
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
                ].map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedColors(selectedColors.filter(c => c !== color.name));
                        } else {
                          setSelectedColors([...selectedColors, color.name]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-full border text-xs font-sans transition-all duration-300 hover:-translate-y-0.5",
                        isSelected 
                          ? "border-primary bg-primary/10 dark:text-white text-gray-900 shadow-[0_0_15px_rgba(230,0,0,0.3)]" 
                          : "dark:border-white/10 border-black/10 dark:text-silver text-gray-600 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-full border dark:border-white/20 border-black/20 transition-all", isSelected && "shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110")} style={{ backgroundColor: color.hex }}></span>
                      {color.name}
                    </button>
                  );
                })}
              </div>
              {selectedColors.length === 0 && (
                <p className="text-xs text-red-500 mt-2 font-medium bg-red-500/10 px-3 py-2 rounded-md inline-block border border-red-500/20">Please select at least one color.</p>
              )}
            </div>

            <div className="space-y-3 group">
              <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors">Description</label>
              <textarea 
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product details, material, fit..." 
                className="w-full bg-black/40 border dark:border-white/10 border-black/10 rounded-xl px-5 py-4 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none placeholder:dark:text-silver text-gray-600/30 shadow-inner"
              ></textarea>
            </div>

            {selectedColors.length > 0 && (
              <div className="space-y-6 pt-6 border-t dark:border-white/10 border-black/10">
                <label className="text-[10px] font-sans uppercase tracking-[0.2em] dark:text-silver text-gray-600">Gambar Berdasarkan Warna (Opsional)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {selectedColors.map(color => (
                    <div key={color} className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border dark:border-white/5 border-black/5 hover:dark:border-white/10 border-black/10 transition-colors">
                      <div className="text-xs dark:text-white text-gray-900/90 font-sans tracking-wide flex justify-between font-medium">
                        <span>{color}</span>
                        {!colorImages[color] && <span className="dark:text-white text-gray-900/30 text-[10px] uppercase tracking-widest">(Default)</span>}
                      </div>
                      <div className="relative group w-full aspect-square bg-black/40 border dark:border-white/10 border-black/10 border-dashed rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-inner" onClick={() => {
                        if (!colorImages[color]) {
                          const el = document.getElementById(`color-upload-${color}`);
                          el?.click();
                        }
                      }}>
                        {colorImages[color] ? (
                          <>
                            <img src={colorImages[color]} alt={`${color} variant`} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 dark:bg-black/60 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                              <label className="bg-white/20 hover:bg-white/40 dark:text-white text-gray-900 p-3 rounded-full cursor-pointer transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]" title="Ganti Gambar">
                                <UploadCloud size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleColorImageChange(color, e)} />
                              </label>
                              <button type="button" onClick={(e) => {
                                e.stopPropagation();
                                const newColorImages = {...colorImages};
                                delete newColorImages[color];
                                setColorImages(newColorImages);
                                const newColorFiles = {...colorFiles};
                                delete newColorFiles[color];
                                setColorFiles(newColorFiles);
                              }} className="bg-red-500/80 hover:bg-red-500 dark:text-white text-gray-900 p-3 rounded-full cursor-pointer transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]" title="Hapus Gambar Khusus">
                                <Trash size={18} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {imagePreview ? (
                              <img src={imagePreview} alt="Default" className="w-full h-full object-contain p-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center">
                                <UploadCloud className="w-6 h-6 dark:text-silver text-gray-600/30 group-hover:text-primary/50 transition-colors" />
                              </div>
                            )}
                            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <UploadCloud className="w-6 h-6 dark:text-white text-gray-900 mb-2 drop-shadow-md group-hover:scale-110 transition-transform" />
                              <p className="text-[9px] dark:text-white text-gray-900 uppercase tracking-widest text-center font-bold px-2 drop-shadow-md">Upload Khusus</p>
                              <input id={`color-upload-${color}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleColorImageChange(color, e)} />
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Image Upload & Actions */}
        <div className="space-y-8">
          <div className="dark:bg-[#050505] bg-white/60 backdrop-blur-xl border dark:border-white/5 border-black/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
            <h2 className="text-xl font-serif dark:text-white text-gray-900 border-b dark:border-white/5 border-black/5 pb-4">Product Image</h2>
            
            <div 
              className={cn(
                "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 relative overflow-hidden group min-h-[300px] cursor-pointer",
                isDragging ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(230,0,0,0.1)]" : "dark:border-white/10 border-black/10 hover:border-primary/50 bg-black/40 hover:dark:bg-black/60 bg-white/60",
                imagePreview ? "border-solid dark:border-white/10 border-black/10 p-0" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />
              
              {imagePreview ? (
                <>
                  <Image src={imagePreview} alt="Preview" fill className="object-cover p-2" unoptimized />
                  <div className="absolute inset-0 dark:bg-black/60 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="bg-red-500 dark:text-white text-gray-900 p-4 rounded-full hover:scale-110 hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    >
                      <Trash size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className={cn(
                    "w-20 h-20 rounded-full bg-white/5 border dark:border-white/10 border-black/10 flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-inner",
                    isDragging ? "scale-110 text-primary border-primary/50 shadow-[0_0_20px_rgba(230,0,0,0.3)]" : "group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 dark:text-silver text-gray-600/50"
                  )}>
                    <UploadCloud size={32} className={cn("transition-transform duration-500", isDragging && "animate-bounce")} />
                  </div>
                  <p className="text-sm font-sans font-medium dark:text-white text-gray-900 mb-2 tracking-wide">Click or drag image to upload</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] dark:text-silver text-gray-600/50">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="dark:bg-[#050505] bg-white/60 backdrop-blur-xl border dark:border-white/5 border-black/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full relative group bg-primary text-black py-4 rounded-xl font-sans uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(230,0,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_infinite]"></div>
              {isSaving ? (
               <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Update Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { X, CheckCircle, Clock, Loader2, MessageCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, clearCart, items } = useCartStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [simulateOrderId, setSimulateOrderId] = useState<number | null>(null);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (isCheckoutOpen) {
      setIsSuccess(false);
      setSimulateOrderId(null);
      setProofFile(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isCheckoutOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill all fields");
      return;
    }
    
    setIsLoading(true);

    try {
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        items: items.map(item => ({
          productId: typeof (item as any).productId === 'number' ? (item as any).productId : null,
          productName: item.name,
          quantity: item.quantity,
          price: typeof item.price === 'string' ? parseInt(item.price.replace(/[^0-9]/g, ""), 10) : item.price,
          size: item.size || null,
          color: item.color || null
        }))
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedOrderNumber(data.orderNumber || `ORD-${data.orderId}`);
        
        setSimulateOrderId(data.orderId);
      } else {
        alert("Failed to create order");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred during checkout");
      setIsLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !simulateOrderId) return;
    setIsUploadingProof(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", proofFile);
      
      const uploadRes = await fetch("/api/upload/payment", {
        method: "POST",
        body: uploadFormData,
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      
      await fetch(`/api/orders/${simulateOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProof: url, status: "Processing" }) 
      });
      
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error uploading proof:", error);
      alert("Gagal mengunggah bukti pembayaran.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
  };
  const formatPrice = (priceNum: number) => {
    return `Rp ${priceNum.toLocaleString("id-ID")}`;
  };
  const totalAmount = items.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0);

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 dark:bg-black/90 bg-white/90 backdrop-blur-md" onClick={!isSuccess ? closeCheckout : undefined} />
      
      <div className="relative w-full max-w-4xl dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/10 border-black/10 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 flex flex-col md:flex-row max-h-[90vh]">
        {!isSuccess && (
          <button onClick={closeCheckout} className="absolute top-4 right-4 z-20 dark:text-silver text-gray-600 hover:dark:text-white text-gray-900">
            <X size={20} />
          </button>
        )}

        {isSuccess ? (
          <div className="w-full p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle size={64} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-serif dark:text-white text-gray-900 mb-2">Payment Successful!</h2>
            <p className="dark:text-silver text-gray-600 font-sans mb-8">Thank you for your purchase. Please confirm your order via WhatsApp to speed up processing.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={closeCheckout}
                className="border dark:border-white/20 border-black/20 dark:text-white text-gray-900 px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <a 
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Admin Yalla Store, saya baru saja melakukan pemesanan dengan nomor order *${completedOrderNumber}* atas nama *${formData.name}*. Tolong dicek ya!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeCheckout}
                className="bg-[#25D366] text-black px-8 py-3 font-sans font-bold uppercase tracking-widest text-sm hover:bg-[#20b858] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Konfirmasi WA
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="w-full md:w-5/12 p-8 border-b md:border-b-0 md:border-r dark:border-white/10 border-black/10 overflow-y-auto dark:bg-[#111] bg-gray-100">
              <h2 className="text-xl font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 dark:bg-[#0a0a0a] bg-gray-50 rounded relative flex-shrink-0 border dark:border-white/5 border-black/5">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm dark:text-white text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest dark:text-silver text-gray-600 mt-1">
                        {item.size && `${item.size}`} {item.color && `/ ${item.color}`} x{item.quantity}
                      </p>
                      <p className="text-xs text-gold mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t dark:border-white/10 border-black/10 pt-4 space-y-2">
                <div className="flex justify-between dark:text-silver text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between dark:text-silver text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="dark:text-white text-gray-900">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-white/10 border-black/10">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
              <h2 className="text-xl font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-6">Shipping Details</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                {simulateOrderId ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                    <h3 className="text-xl font-serif dark:text-white text-gray-900 mb-2">Transfer Pembayaran</h3>
                    <p className="dark:text-silver text-gray-600 text-sm mb-6">Silakan transfer sesuai total tagihan ke rekening berikut:</p>
                    
                    <div className="dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 p-6 rounded-xl mb-6 w-full max-w-sm">
                      <p className="text-xs uppercase tracking-widest dark:text-silver text-gray-600 mb-1">Bank BCA</p>
                      <p className="text-2xl font-bold dark:text-white text-gray-900 mb-1">7600262275</p>
                      <p className="text-sm text-gold">a.n. Mustofa</p>
                    </div>

                    <div className="w-full max-w-sm text-left mb-6">
                      <label className="text-xs uppercase tracking-widest dark:text-silver text-gray-600 block mb-2">Unggah Bukti Transfer</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center justify-center w-full px-4 py-3 dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded border-dashed hover:border-primary/50 transition-colors">
                          <Upload size={16} className="dark:text-silver text-gray-600 mr-2" />
                          <span className="text-sm dark:text-silver text-gray-600 truncate">
                            {proofFile ? proofFile.name : "Pilih gambar bukti transfer..."}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={handleUploadProof}
                      disabled={isUploadingProof || !proofFile}
                      className="bg-primary text-black w-full max-w-sm py-4 font-sans uppercase tracking-widest text-sm hover:bg-white transition-colors font-bold rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingProof ? <Loader2 className="animate-spin" /> : "Konfirmasi Pembayaran"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest dark:text-silver text-gray-600">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest dark:text-silver text-gray-600">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest dark:text-silver text-gray-600">WhatsApp Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
                          placeholder="08123456789"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest dark:text-silver text-gray-600">Complete Shipping Address</label>
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-4 py-3 dark:text-white text-gray-900 h-24 resize-none focus:outline-none focus:border-primary transition-colors"
                        placeholder="Street name, building, house no."
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-primary text-black py-4 font-sans uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed rounded"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : `Pay ${formatPrice(totalAmount)}`}
                    </button>
                  </>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


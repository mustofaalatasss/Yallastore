"use client";

import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { X, CheckCircle, Clock, Loader2, MessageCircle } from "lucide-react";
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

  const [dummyQRIS, setDummyQRIS] = useState(false);
  const [simulateOrderId, setSimulateOrderId] = useState<number | null>(null);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (isCheckoutOpen) {
      setIsSuccess(false);
      setDummyQRIS(false);
      setSimulateOrderId(null);
      document.body.style.overflow = "hidden";
      
      // Load Midtrans Snap Script
      const scriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DUMMY";
      
      let script = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.src = scriptUrl;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        document.body.appendChild(script);
      }
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
        
        if (data.snapToken && window.snap) {
          window.snap.pay(data.snapToken, {
            onSuccess: function (result: any) {
              handleSimulatePayment(data.orderId);
            },
            onPending: function (result: any) {
              alert("Payment pending. Please complete your payment.");
              closeCheckout();
              setIsLoading(false);
            },
            onError: function (result: any) {
              alert("Payment failed!");
              setIsLoading(false);
            },
            onClose: function () {
              // Customer closed the popup without finishing the payment
              setIsLoading(false);
            }
          });
        } else {
          // Fallback to dummy QRIS mode
          setSimulateOrderId(data.orderId);
          setDummyQRIS(true);
        }
      } else {
        alert("Failed to create order");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred during checkout");
      setIsLoading(false);
    }
  };

  const handleSimulatePayment = async (orderId: number) => {
    setIsLoading(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Processing" }) // Wait, in the backend we need to allow "Processing" or use "Completed" bypass
      });
    } catch (error) {
      console.error("Error updating order:", error);
    }
    setDummyQRIS(false);
    setIsSuccess(true);
    setIsLoading(false);
    clearCart();
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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={!isSuccess ? closeCheckout : undefined} />
      
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-10 flex flex-col md:flex-row max-h-[90vh]">
        {!isSuccess && (
          <button onClick={closeCheckout} className="absolute top-4 right-4 z-20 text-silver hover:text-white">
            <X size={20} />
          </button>
        )}

        {isSuccess ? (
          <div className="w-full p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle size={64} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-serif text-white mb-2">Payment Successful!</h2>
            <p className="text-silver font-sans mb-8">Thank you for your purchase. Please confirm your order via WhatsApp to speed up processing.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={closeCheckout}
                className="border border-white/20 text-white px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
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
            <div className="w-full md:w-5/12 p-8 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto bg-[#111]">
              <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#0a0a0a] rounded relative flex-shrink-0 border border-white/5">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-silver mt-1">
                        {item.size && `${item.size}`} {item.color && `/ ${item.color}`} x{item.quantity}
                      </p>
                      <p className="text-xs text-gold mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-silver text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-silver text-sm">
                  <span>Shipping</span>
                  <span className="text-white">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
              <h2 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Shipping Details</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                {dummyQRIS ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                    <h3 className="text-xl font-serif text-white mb-2">Simulate Payment (QRIS)</h3>
                    <p className="text-silver text-sm mb-6">Since you are using a DUMMY key, please simulate the payment here.</p>
                    
                    <div className="bg-white p-4 rounded-xl mb-6 relative">
                      {/* Fake QR Barcode using simple CSS patterns */}
                      <div className="w-48 h-48 bg-white flex flex-col gap-1 p-2 border-4 border-black">
                        <div className="flex justify-between w-full h-12">
                          <div className="w-12 h-12 border-4 border-black bg-black/20" />
                          <div className="w-12 h-12 border-4 border-black bg-black/20" />
                        </div>
                        <div className="w-full flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-repeat opacity-80" />
                        <div className="w-12 h-12 border-4 border-black bg-black/20" />
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => handleSimulatePayment(simulateOrderId!)}
                      disabled={isLoading}
                      className="bg-primary text-black px-8 py-3 font-sans uppercase tracking-widest text-sm hover:bg-white transition-colors font-bold rounded"
                    >
                      {isLoading ? "Processing..." : "Mark as Paid"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-silver">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-silver">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-silver">WhatsApp Number</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                          placeholder="08123456789"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-silver">Complete Shipping Address</label>
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-[#111] border border-white/10 rounded px-4 py-3 text-white h-24 resize-none focus:outline-none focus:border-primary transition-colors"
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


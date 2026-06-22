"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, Star } from "lucide-react";
import Image from "next/image";

export default function TrackOrderClient() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState("");

  // Review states
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = async (productId: number) => {
    if (!comment.trim() || !orderData) return;
    
    setIsSubmittingReview(true);
    setReviewSuccess(false);
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          reviewerName: orderData.customerName,
          rating,
          comment
        })
      });

      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewingProductId(null);
          setReviewSuccess(false);
          setComment("");
          setRating(5);
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) return;
    
    setIsLoading(true);
    setError("");
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/track?orderId=${orderId}&phone=${phone}`);
      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
      } else {
        const err = await res.json();
        setError(err.error || "Order not found. Please check your details.");
      }
    } catch (err) {
      setError("An error occurred while tracking your order.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="text-gold" size={24} />;
      case "processing": return <Package className="text-blue-500" size={24} />;
      case "shipped": return <Truck className="text-purple-500" size={24} />;
      case "completed": return <CheckCircle className="text-green-500" size={24} />;
      default: return <Clock className="dark:text-silver text-gray-600" size={24} />;
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-12">
        <input 
          type="text" 
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID (e.g. YALLA-12345)"
          className="flex-1 dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-6 py-4 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
          required
        />
        <input 
          type="tel" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp Number"
          className="flex-1 dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-6 py-4 dark:text-white text-gray-900 focus:outline-none focus:border-primary transition-colors"
          required
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-primary text-black px-8 py-4 font-sans uppercase tracking-widest text-sm font-bold hover:bg-white transition-colors flex items-center justify-center min-w-[150px]"
        >
          {isLoading ? "Searching..." : <><Search size={18} className="mr-2" /> Track</>}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded text-center font-sans">
          {error}
        </div>
      )}

      {orderData && (
        <div className="dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded-xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b dark:border-white/10 border-black/10 pb-6 mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-serif dark:text-white text-gray-900 mb-1">Order {orderData.orderNumber}</h2>
              <p className="dark:text-silver text-gray-600 text-sm">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3 dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 px-6 py-3 rounded-full">
              {getStatusIcon(orderData.status)}
              <span className="dark:text-white text-gray-900 font-sans uppercase tracking-widest text-sm font-bold">
                {orderData.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-4">Items</h3>
              <div className="space-y-4">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex flex-col gap-4 dark:bg-[#0a0a0a] bg-gray-50 p-4 rounded border dark:border-white/5 border-black/5">
                    <div className="flex gap-4">
                      {item.product?.image && (
                        <div className="w-16 h-16 dark:bg-[#111] bg-gray-100 rounded relative flex-shrink-0 border dark:border-white/5 border-black/5">
                          <Image src={item.product.image} alt={item.productName} fill className="object-contain p-1" unoptimized />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm dark:text-white text-gray-900 line-clamp-1">{item.productName}</h4>
                        <p className="text-[10px] uppercase tracking-widest dark:text-silver text-gray-600 mt-1">
                          {item.size && `${item.size}`} {item.color && `/ ${item.color}`} x{item.quantity}
                        </p>
                        <p className="text-xs text-gold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                      
                      {item.productId && (
                        <div className="flex items-center">
                          <button 
                            onClick={() => setReviewingProductId(reviewingProductId === item.productId ? null : item.productId)}
                            className="text-xs border dark:border-white/20 border-black/20 hover:border-white px-3 py-1 rounded dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors uppercase tracking-widest"
                          >
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Review Form Inline */}
                    {reviewingProductId === item.productId && (
                      <div className="mt-2 pt-4 border-t dark:border-white/10 border-black/10 animate-in fade-in duration-300">
                        <h4 className="text-xs dark:text-white text-gray-900 uppercase tracking-widest font-sans mb-3">Review this item</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] dark:text-silver text-gray-600 mb-1 uppercase tracking-widest">Rating</label>
                            <div className="flex gap-1 cursor-pointer">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={16} 
                                  onClick={() => setRating(star)}
                                  className={star <= rating ? "fill-gold text-gold" : "dark:text-silver text-gray-600/30"} 
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] dark:text-silver text-gray-600 mb-1 uppercase tracking-widest">Comment</label>
                            <textarea 
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-3 py-2 dark:text-white text-gray-900 text-xs h-16 resize-none focus:outline-none focus:border-primary"
                              placeholder="What do you think about this product?"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setReviewingProductId(null)}
                              className="px-3 py-1.5 text-xs dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSubmitReview(item.productId)}
                              disabled={isSubmittingReview || !comment.trim()}
                              className="bg-primary hover:bg-white text-black px-4 py-1.5 text-xs font-sans uppercase tracking-widest transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmittingReview ? "..." : "Submit"}
                            </button>
                          </div>
                          {reviewSuccess && <p className="text-green-500 text-xs mt-2">Review submitted successfully!</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-4">Shipping Details</h3>
                <div className="dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 p-4 rounded text-sm dark:text-silver text-gray-600 font-sans space-y-1">
                  <p className="dark:text-white text-gray-900">{orderData.customerName}</p>
                  <p>{orderData.customerPhone}</p>
                  <p>{orderData.shippingAddress || "No address provided"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-4">Summary</h3>
                <div className="dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 p-4 rounded space-y-2">
                  <div className="flex justify-between dark:text-silver text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>Rp {orderData.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between dark:text-silver text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span className="dark:text-white text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-white/10 border-black/10 text-gold">
                    <span>Total</span>
                    <span>Rp {orderData.totalAmount.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

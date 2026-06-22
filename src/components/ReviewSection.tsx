"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface ReviewSectionProps {
  productId: number | string;
  readOnly?: boolean;
}

export default function ReviewSection({ productId, readOnly = false }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment || readOnly) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          reviewerName,
          rating,
          comment
        })
      });

      if (res.ok) {
        setReviewerName("");
        setRating(5);
        setComment("");
        fetchReviews(); // Refresh list
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t dark:border-white/10 border-black/10">
      <h3 className="text-xl font-serif dark:text-white text-gray-900 uppercase tracking-widest mb-6">Customer Reviews</h3>
      
      {/* Review List */}
      <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <p className="dark:text-silver text-gray-600 text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="dark:text-silver text-gray-600 text-sm">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="dark:bg-[#0a0a0a] bg-gray-50 p-4 rounded border dark:border-white/5 border-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans dark:text-white text-gray-900 text-sm font-bold">{review.reviewerName}</span>
                <span className="dark:text-silver text-gray-600 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < review.rating ? "fill-gold text-gold" : "dark:text-silver text-gray-600/30"} />
                ))}
              </div>
              <p className="dark:text-silver text-gray-600 text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      {!readOnly && (
      <form onSubmit={handleSubmit} className="dark:bg-[#0a0a0a] bg-gray-50 p-4 rounded border dark:border-white/10 border-black/10 space-y-4">
        <h4 className="text-sm dark:text-white text-gray-900 uppercase tracking-widest font-sans">Write a Review</h4>
        
        <div>
          <label className="block text-xs dark:text-silver text-gray-600 mb-1">Your Name</label>
          <input 
            type="text" 
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-3 py-2 dark:text-white text-gray-900 text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-xs dark:text-silver text-gray-600 mb-1">Rating</label>
          <div className="flex gap-1 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={20} 
                onClick={() => setRating(star)}
                className={star <= rating ? "fill-gold text-gold" : "dark:text-silver text-gray-600/30"} 
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs dark:text-silver text-gray-600 mb-1">Review</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded px-3 py-2 dark:text-white text-gray-900 text-sm h-20 resize-none focus:outline-none focus:border-primary"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-white/10 hover:bg-white/20 dark:text-white text-gray-900 border dark:border-white/20 border-black/20 py-2 text-xs font-sans uppercase tracking-widest transition-colors rounded"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
      )}
    </div>
  );
}

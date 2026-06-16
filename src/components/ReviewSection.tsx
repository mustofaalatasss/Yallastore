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
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-xl font-serif text-white uppercase tracking-widest mb-6">Customer Reviews</h3>
      
      {/* Review List */}
      <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <p className="text-silver text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-silver text-sm">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-[#0a0a0a] p-4 rounded border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-white text-sm font-bold">{review.reviewerName}</span>
                <span className="text-silver text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < review.rating ? "fill-gold text-gold" : "text-silver/30"} />
                ))}
              </div>
              <p className="text-silver text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      {!readOnly && (
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-4 rounded border border-white/10 space-y-4">
        <h4 className="text-sm text-white uppercase tracking-widest font-sans">Write a Review</h4>
        
        <div>
          <label className="block text-xs text-silver mb-1">Your Name</label>
          <input 
            type="text" 
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-silver mb-1">Rating</label>
          <div className="flex gap-1 cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={20} 
                onClick={() => setRating(star)}
                className={star <= rating ? "fill-gold text-gold" : "text-silver/30"} 
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-silver mb-1">Review</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-white text-sm h-20 resize-none focus:outline-none focus:border-primary"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-2 text-xs font-sans uppercase tracking-widest transition-colors rounded"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
      )}
    </div>
  );
}

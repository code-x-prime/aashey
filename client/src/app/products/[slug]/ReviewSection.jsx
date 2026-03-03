"use client";

import { useState, useRef } from "react";
import { Star, AlertCircle, Upload, X, ImageIcon, Filter, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchApi, API_URL } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import Image from "next/image";

const STAR_LABELS = ["Terrible", "Poor", "Average", "Good", "Excellent"];
const FILTERS = [
  { label: "All Reviews", value: "all" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
  { label: "With Photos", value: "photos" },
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

function StarRating({ value, onChange, size = "lg", readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4"}
            fill={s <= active ? "#F59E0B" : "none"}
            stroke={s <= active ? "#F59E0B" : "#D1D5DB"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ rating, count, total, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={() => onClick(String(rating))}
      className="flex items-center gap-2 w-full group"
    >
      <span className="text-xs text-amber-700 w-5 text-right shrink-0">{rating}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500 group-hover:bg-amber-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-6 text-right shrink-0">{count}</span>
    </button>
  );
}

function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const arr = Array.from(files);
    const remaining = 3 - images.length;
    if (remaining <= 0) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    const toAdd = arr.slice(0, remaining);
    const invalid = toAdd.filter((f) => !f.type.startsWith("image/"));
    if (invalid.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }
    const withPreviews = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...images, ...withPreviews]);
  };

  const remove = (idx) => {
    const next = [...images];
    URL.revokeObjectURL(next[idx].preview);
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos <span className="text-gray-400 font-normal">(optional, up to 3)</span>
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-200 bg-amber-50 group">
            <Image src={img.preview} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {images.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Upload className="h-5 w-5 text-amber-500" />
            <span className="text-xs text-amber-600">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

function ReviewCard({ review }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {review.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{review.user?.name || "Customer"}</p>
            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {review.title && (
        <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
      )}
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightbox(img)}
              className="w-16 h-16 rounded-lg overflow-hidden border border-amber-200 hover:border-amber-400 transition-colors relative"
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {review.adminReply && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-700 mb-1">Response from Aashey:</p>
          <p className="text-sm text-gray-700">{review.adminReply}</p>
          {review.adminReplyDate && (
            <p className="text-xs text-gray-400 mt-1">{new Date(review.adminReplyDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          )}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full">
            <Image src={lightbox} alt="" fill className="object-contain rounded-lg" width={100} height={100} />
            <button className="absolute top-2 right-2 bg-white/20 rounded-full p-1 text-white hover:bg-white/40">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewSection({ product }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", comment: "" });
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const reviews = product.reviews || [];

  const ratingCounts = [5, 4, 3, 2, 1].reduce((acc, r) => {
    acc[r] = reviews.filter((rev) => rev.rating === r).length;
    return acc;
  }, {});

  const filteredReviews = (() => {
    let list = [...reviews];
    if (activeFilter === "photos") list = list.filter((r) => r.images && r.images.length > 0);
    else if (activeFilter === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (activeFilter === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (["1", "2", "3", "4", "5"].includes(activeFilter)) list = list.filter((r) => r.rating === parseInt(activeFilter));
    return list;
  })();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const validate = () => {
    const errors = {};
    if (reviewForm.rating === 0) errors.rating = "Please select a rating";
    if (!reviewForm.comment.trim()) errors.comment = "Please write a review";
    if (reviewForm.title.trim() && reviewForm.title.trim().length < 3) errors.title = "Title must be at least 3 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/auth?redirect=/products/${product.slug}&review=true`);
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let uploadedImages = [];

      // Upload images first if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(({ file }) => formData.append("images", file));
        const uploadRes = await fetch(`${API_URL}/users/reviews/upload-images`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedImages = uploadData.data.images;
        } else {
          toast.error("Failed to upload images. Review will be submitted without them.");
        }
      }

      const response = await fetchApi("/users/reviews", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title.trim() || undefined,
          comment: reviewForm.comment.trim(),
          images: uploadedImages,
        }),
      });

      if (response.success) {
        setSubmitted(true);
        setShowForm(false);
        setReviewForm({ rating: 0, title: "", comment: "" });
        setImages([]);
        images.forEach(({ preview }) => URL.revokeObjectURL(preview));
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeFilterLabel = FILTERS.find((f) => f.value === activeFilter)?.label || "All Reviews";

  return (
    <div className="space-y-8">
      {/* Summary Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Big rating number */}
          <div className="text-center shrink-0">
            <div className="text-5xl font-bold text-amber-600 font-playfair">{avgRating}</div>
            <StarRating value={Math.round(parseFloat(avgRating))} readOnly size="sm" />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
          </div>

          {/* Rating bars */}
          <div className="flex-1 space-y-1.5 w-full">
            {[5, 4, 3, 2, 1].map((r) => (
              <RatingBar
                key={r}
                rating={r}
                count={ratingCounts[r] || 0}
                total={reviews.length}
                onClick={(v) => setActiveFilter(v)}
              />
            ))}
          </div>

          {/* Write review CTA */}
          <div className="shrink-0">
            {submitted ? (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 className="h-4 w-4" />
                Review submitted! Awaiting approval.
              </div>
            ) : (
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(`/auth?redirect=/products/${product.slug}&review=true`);
                    return;
                  }
                  setShowForm((v) => !v);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium whitespace-nowrap"
              >
                {showForm ? "Cancel" : "Write a Review"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-base mb-5 flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            Share your experience
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  value={reviewForm.rating}
                  onChange={(r) => {
                    setReviewForm((p) => ({ ...p, rating: r }));
                    setFormErrors((p) => ({ ...p, rating: null }));
                  }}
                  size="lg"
                />
                {reviewForm.rating > 0 && (
                  <span className="text-sm text-amber-600 font-medium">{STAR_LABELS[reviewForm.rating - 1]}</span>
                )}
              </div>
              {formErrors.rating && <p className="text-xs text-red-500 mt-1">{formErrors.rating}</p>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="rev-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Review Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="rev-title"
                type="text"
                value={reviewForm.title}
                onChange={(e) => {
                  setReviewForm((p) => ({ ...p, title: e.target.value }));
                  setFormErrors((p) => ({ ...p, title: null }));
                }}
                placeholder="Summarize your experience"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${formErrors.title ? "border-red-400" : "border-gray-200"}`}
              />
              {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="rev-comment" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rev-comment"
                value={reviewForm.comment}
                onChange={(e) => {
                  setReviewForm((p) => ({ ...p, comment: e.target.value }));
                  setFormErrors((p) => ({ ...p, comment: null }));
                }}
                rows={4}
                placeholder="Tell others about your experience with this product..."
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none ${formErrors.comment ? "border-red-400" : "border-gray-200"}`}
              />
              {formErrors.comment && <p className="text-xs text-red-500 mt-1">{formErrors.comment}</p>}
            </div>

            {/* Image uploader */}
            <ImageUploader images={images} onChange={setImages} />

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormErrors({});
                  setReviewForm({ rating: 0, title: "", comment: "" });
                  images.forEach(({ preview }) => URL.revokeObjectURL(preview));
                  setImages([]);
                }}
                className="rounded-xl border-gray-200 text-gray-600 px-5 py-2.5 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-5">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
              <Filter className="h-4 w-4" />
              Filter:
            </div>
            {/* Compact filter buttons on desktop */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeFilter === f.value
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Dropdown on mobile */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 hover:border-amber-300"
              >
                {activeFilterLabel}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[160px]">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setActiveFilter(f.value); setShowFilterMenu(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 ${activeFilter === f.value ? "text-amber-600 font-medium bg-amber-50" : "text-gray-700"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-gray-400 ml-auto">
              {filteredReviews.length} of {reviews.length} reviews
            </span>
          </div>

          {/* Review cards */}
          {filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No reviews match this filter.</p>
              <button onClick={() => setActiveFilter("all")} className="text-amber-600 text-sm font-medium mt-2 hover:underline">
                Clear filter
              </button>
            </div>
          )}
        </div>
      ) : (
        !submitted && (
          <div className="text-center py-14 bg-amber-50/50 rounded-2xl border border-amber-100">
            <Star className="h-12 w-12 text-amber-200 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">No reviews yet</p>
            <p className="text-gray-400 text-sm mb-6">Be the first to share your experience!</p>
            {!showForm && (
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(`/auth?redirect=/products/${product.slug}&review=true`);
                    return;
                  }
                  setShowForm(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 py-2.5 text-sm"
              >
                Write the First Review
              </Button>
            )}
          </div>
        )
      )}

      {!isAuthenticated && !showForm && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>You need to <button onClick={() => router.push(`/auth?redirect=/products/${product.slug}&review=true`)} className="underline font-medium">log in</button> and have purchased this product to write a review.</span>
        </div>
      )}
    </div>
  );
}

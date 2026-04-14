"use client";

import { useEffect, useRef, useState } from "react";
import { RiStarFill, RiStarHalfFill } from "react-icons/ri";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Mumbai",
    rating: 5,
    time: "2 weeks ago",
    review:
      "The purest ghee I've ever tasted! You can truly feel the difference — the aroma, the texture, everything reminds me of my grandmother's homemade ghee.",
    avatar: "#C2523C",
    initial: "R",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Delhi",
    rating: 5,
    time: "1 month ago",
    review:
      "Switched to Aashey A2 Ghee for my family and never looked back. The Bilona method really makes a difference. My kids absolutely love the taste!",
    avatar: "#8B44AC",
    initial: "P",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Bangalore",
    rating: 5,
    time: "3 weeks ago",
    review:
      "Lab tested, FSSAI certified, and incredibly pure. I use it daily for cooking and even in my morning haldi milk. Highly recommended to everyone!",
    avatar: "#1A73E8",
    initial: "A",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    location: "Hyderabad",
    rating: 5,
    time: "5 days ago",
    review:
      "Love the rich golden color and amazing fragrance. Free delivery above ₹999 is a great bonus. This ghee is now a permanent staple in my kitchen.",
    avatar: "#0F9D58",
    initial: "S",
  },
  {
    id: 5,
    name: "Kavitha Iyer",
    location: "Chennai",
    rating: 5,
    time: "2 months ago",
    review:
      "Using it for all religious rituals and cooking. The purity is evident in every spoonful. My entire family has happily made the switch.",
    avatar: "#F4B400",
    initial: "K",
  },
  {
    id: 6,
    name: "Deepak Gupta",
    location: "Chandigarh",
    rating: 5,
    time: "1 week ago",
    review:
      "Ordered for the first time and was thoroughly impressed. The lab report included with every batch adds genuine trust in the brand.",
    avatar: "#DB4437",
    initial: "D",
  },
  {
    id: 7,
    name: "Sunita Reddy",
    location: "Hyderabad",
    rating: 5,
    time: "3 months ago",
    review:
      "Excellent quality. My mother says it reminds her of the ghee from her childhood village. That is the highest compliment any ghee can get.",
    avatar: "#E91E8C",
    initial: "S",
  },
  {
    id: 8,
    name: "Ramesh Patel",
    location: "Mumbai",
    rating: 5,
    time: "4 weeks ago",
    review:
      "Finally found genuinely pure A2 ghee. The Bilona method makes such a noticeable difference in taste and richness. Will never switch back.",
    avatar: "#00897B",
    initial: "R",
  },
];

/* ── Google "G" SVG Logo ──────────────────────────── */
function GoogleLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Stars row ───────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <RiStarFill key={i} className="w-3.5 h-3.5 text-[#F5A623]" />
      ))}
    </div>
  );
}

/* ── Single Google-style Review Card ────────────── */
function GoogleReviewCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.review.length > 120;
  const displayText = !expanded && isLong
    ? item.review.slice(0, 120) + "…"
    : item.review;

  return (
    <div className="flex-shrink-0 w-[300px] md:w-[320px] bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.05)" }}>

      {/* ── Top row: avatar + name + Google logo ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-sans font-semibold text-base select-none"
            style={{ backgroundColor: item.avatar }}
          >
            {item.initial}
          </div>
          <div>
            <p className="font-sans text-[13.5px] font-semibold text-gray-800 leading-tight">
              {item.name}
            </p>
            <p className="font-sans text-[11px] text-gray-400 mt-0.5 leading-none">
              {item.location}
            </p>
          </div>
        </div>

        {/* Google logo */}
        <div className="flex-shrink-0">
          <GoogleLogo size={18} />
        </div>
      </div>

      {/* ── Stars + time ── */}
      <div className="flex items-center gap-2">
        <Stars rating={item.rating} />
        <span className="font-sans text-[11px] text-gray-400">{item.time}</span>
      </div>

      {/* ── Review text ── */}
      <p className="font-sans text-[13px] text-gray-600 leading-relaxed">
        {displayText}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-[#1A73E8] font-medium hover:underline text-[12px]"
          >
            {expanded ? "Less" : "More"}
          </button>
        )}
      </p>

      {/* ── "Posted on Google" footer ── */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 mt-auto">
        <GoogleLogo size={12} />
        <span className="font-sans text-[10.5px] text-gray-400 tracking-wide">
          Posted on Google
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */
export function TestimonialsCarousel({ bg = "cream", showStats = false }) {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);

  const bgClass = bg === "white" ? "bg-white" : "bg-[#FDF6E3]";
  const fadeColor = bg === "white" ? "#ffffff" : "#FDF6E3";

  /* ── Infinite auto-scroll ─────────────────────── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const SPEED = 0.45;

    const animate = () => {
      if (!isPaused) {
        posRef.current += SPEED;
        const halfWidth = track.scrollWidth / 2;
        if (posRef.current >= halfWidth) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused]);

  const loopItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className={`py-10 md:py-14 ${bgClass} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">

        {/* ── Header ──────────────────────────────── */}
        <div className="text-center mb-10 md:mb-12">
          <span className="section-eyebrow">Real Stories</span>
          <h2 className="section-title mt-3">What Our Customers Say</h2>

          {/* Google rating summary */}
          <div className="inline-flex items-center gap-3 mt-4 bg-white border border-gray-100 rounded-2xl px-5 py-3"
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
            <GoogleLogo size={22} />
            <div className="w-px h-6 bg-gray-100" />
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[22px] font-bold text-gray-800 leading-none">4.9</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <RiStarFill key={i} className="w-4 h-4 text-[#F5A623]" />
                  ))}
                </div>
              </div>
              <span className="font-sans text-[11px] text-gray-400 mt-0.5">500+ Google reviews</span>
            </div>
          </div>

          <div className="section-underline-center mt-6" />
        </div>
      </div>

      {/* ── Carousel — full bleed ─────────────────── */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${fadeColor} 0%, transparent 100%)` }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${fadeColor} 0%, transparent 100%)` }} />

        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-4 py-3 px-6"
            style={{ width: "max-content", willChange: "transform" }}
          >
            {loopItems.map((item, idx) => (
              <GoogleReviewCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────── */}
      {showStats && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="mt-14 pt-10 border-t border-[#C9933A]/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "4.9★", label: "Google Rating" },
              { number: "99%", label: "Satisfaction Rate" },
              { number: "25+", label: "Years Legacy" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-playfair text-4xl md:text-5xl font-bold text-[#C9933A] leading-none mb-2">
                  {stat.number}
                </p>
                <p className="font-sans text-xs font-semibold tracking-[0.12em] text-[#6B4423] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default TestimonialsCarousel;
"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rahul Sharma",
    location: "Mumbai",
    rating: 5,
    title: "Tastes Like Grandma's Ghee",
    review:
      "The purest ghee I've ever tasted! You can truly feel the difference — the aroma, the texture, everything reminds me of my grandmother's homemade ghee.",
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Delhi",
    rating: 5,
    title: "My Family's New Staple",
    review:
      "Switched to Aashey A2 Ghee for my family and never looked back. The Bilona method really makes a difference. My kids absolutely love the taste!",
  },
  {
    id: 3,
    name: "Amit Kumar",
    location: "Bangalore",
    rating: 5,
    title: "Certified Purity You Can Trust",
    review:
      "Lab tested, FSSAI certified, and incredibly pure. I use it daily for cooking and even in my morning haldi milk. Highly recommended to everyone!",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    location: "Hyderabad",
    rating: 5,
    title: "Rich Aroma, Every Time",
    review:
      "Love the rich golden color and amazing fragrance. Free delivery above ₹999 is a great bonus. This ghee is now a permanent staple in my kitchen.",
  },
  {
    id: 5,
    name: "Kavitha Iyer",
    location: "Chennai",
    rating: 5,
    title: "Pure in Every Spoonful",
    review:
      "Using it for all religious rituals and cooking. The purity is evident in every spoonful. My entire family has happily made the switch.",
  },
  {
    id: 6,
    name: "Deepak Gupta",
    location: "Chandigarh",
    rating: 5,
    title: "Lab Report Builds Real Trust",
    review:
      "Ordered for the first time and was thoroughly impressed. The lab report included with every batch adds genuine trust in the brand.",
  },
  {
    id: 7,
    name: "Sunita Reddy",
    location: "Hyderabad",
    rating: 5,
    title: "Childhood Memories Revived",
    review:
      "Excellent quality. My mother says it reminds her of the ghee from her childhood village. That is the highest compliment any ghee can get.",
  },
  {
    id: 8,
    name: "Ramesh Patel",
    location: "Mumbai",
    rating: 5,
    title: "Bilona Method Makes the Difference",
    review:
      "Finally found genuinely pure A2 ghee. The Bilona method makes such a noticeable difference in taste and richness. Will never switch back.",
  },
];

function TestimonialCard({ item }) {
  return (
    <div
      className="flex-shrink-0 w-[300px] md:w-[340px] bg-white rounded-2xl p-6 border border-[#C9933A]/15 flex flex-col gap-4"
      style={{ boxShadow: "0 4px 24px rgba(63,31,0,0.07)" }}
    >
      {/* Decorative quote + stars */}
      <div className="flex items-start justify-between">
        <Quote className="w-8 h-8 text-[#C9933A]/30 fill-[#C9933A]/20 flex-shrink-0" />
        <div className="flex items-center gap-0.5">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 text-[#C9933A] fill-[#C9933A]" />
          ))}
        </div>
      </div>

      {/* Title */}
      <p className="font-playfair font-bold text-[#3F1F00] text-base leading-snug">
        {item.title}
      </p>

      {/* Review text */}
      <p className="font-sans text-sm text-[#5C3A1E] leading-relaxed flex-grow">
        &ldquo;{item.review}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-[#C9933A]/10">
        <div className="w-9 h-9 rounded-full bg-[#3F1F00] flex items-center justify-center flex-shrink-0">
          <span className="font-playfair font-bold text-sm text-[#C9933A]">
            {item.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-sans font-semibold text-sm text-[#3F1F00]">{item.name}</p>
          <p className="font-sans text-xs text-[#8B6040]">{item.location}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsCarousel({ bg = "cream", showStats = false }) {
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);

  const bgClass = bg === "white" ? "bg-white" : "bg-[#FDF6E3]";

  // Infinite auto-scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const SPEED = 0.5;

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
        {/* Header */}
        <div className="text-center mb-12 md:mb-14">
          <span className="section-eyebrow">Real Stories</span>
          <h2 className="section-title mt-3">What Our Customers Say</h2>
          <p className="font-cormorant italic text-[#C9933A] text-xl mt-2">
            Pure trust, from real families across India
          </p>
          <div className="section-underline-center mt-5" />
        </div>
      </div>

      {/* Carousel — full width, no container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${bg === "white" ? "#fff" : "#FDF6E3"} 0%, transparent 100%)` }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${bg === "white" ? "#fff" : "#FDF6E3"} 0%, transparent 100%)` }}
        />

        <div
          className="overflow-hidden cursor-default"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-5 py-2 px-6"
            style={{ width: "max-content", willChange: "transform" }}
          >
            {loopItems.map((item, idx) => (
              <TestimonialCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats row (optional) */}
      {showStats && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="mt-14 pt-10 border-t border-[#C9933A]/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "4.8★", label: "Average Rating" },
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

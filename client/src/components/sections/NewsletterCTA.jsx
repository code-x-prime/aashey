"use client";

import { useState } from "react";
import { Mail, Shield, Leaf, Heart, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib/utils";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | already
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetchApi("/public/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const msg = res.message || "";
      if (msg.toLowerCase().includes("already")) {
        setStatus("already");
      } else {
        setStatus("success");
      }
      setMessage(msg);
      setEmail("");
      setName("");
    } catch (err) {
      // fetchApi throws on 4xx/5xx — check if it's a known error
      const msg =
        err?.data?.message || err?.message || "Something went wrong. Please try again.";
      setStatus("error");
      setMessage(msg);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-[#3F1F00] relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #C9933A 1px, transparent 0)", backgroundSize: "28px 28px" }}
      />
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9933A]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C9933A]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="w-8 h-px bg-[#C9933A]/40" />
          <span className="font-sans text-xs font-semibold tracking-[0.2em] text-[#C9933A]/80 uppercase">
            Exclusive Community
          </span>
          <span className="w-8 h-px bg-[#C9933A]/40" />
        </div>

        {/* Heading */}
        <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-bold text-[#FDF6E3] leading-tight mb-3">
          Join Our{" "}
          <span className="italic text-[#C9933A]">Royal Community</span>
        </h2>

        {/* Subheading */}
        <p className="font-sans text-[#FDF6E3]/60 text-base md:text-lg mb-10 leading-relaxed">
          Exclusive recipes, wellness tips, seasonal offers & early access to new arrivals —
          straight to your inbox. No spam, ever.
        </p>

        {/* ── SUCCESS STATE ── */}
        {(status === "success" || status === "already") && (
          <div className="bg-[#FDF6E3]/8 border border-[#C9933A]/30 rounded-2xl px-8 py-8 mb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#C9933A]/15 border border-[#C9933A]/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-[#C9933A]" />
            </div>
            <p className="font-playfair font-bold text-[#FDF6E3] text-xl mb-1">
              {status === "already" ? "Already Subscribed!" : "You're in! 🙏"}
            </p>
            <p className="font-sans text-sm text-[#FDF6E3]/60 leading-relaxed">
              {status === "already"
                ? "This email is already part of our community."
                : "Check your inbox for a welcome message from us."}
            </p>
          </div>
        )}

        {/* ── FORM ── */}
        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-8">
            {/* Name field */}
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
              className="w-full px-5 py-3.5 bg-white/[0.06] border border-[#C9933A]/20 rounded-xl
                text-[#FDF6E3] placeholder-[#FDF6E3]/25 font-sans text-sm
                focus:outline-none focus:border-[#C9933A]/60 focus:bg-white/[0.09]
                disabled:opacity-50 transition-all"
            />

            {/* Email + Button row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9933A]/50 pointer-events-none" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] border border-[#C9933A]/20 rounded-xl
                    text-[#FDF6E3] placeholder-[#FDF6E3]/25 font-sans text-sm
                    focus:outline-none focus:border-[#C9933A]/60 focus:bg-white/[0.09]
                    disabled:opacity-50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3.5
                  bg-[#C9933A] text-[#3F1F00] font-sans font-bold text-sm tracking-wide rounded-xl
                  hover:bg-[#F0C96B] active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Subscribe</>
                )}
              </button>
            </div>

            {/* Error message */}
            {status === "error" && (
              <p className="font-sans text-sm text-red-400 text-center">{message}</p>
            )}
          </form>
        )}

        {/* Divider */}
        <div className="w-24 h-px bg-[#C9933A]/20 mx-auto mb-7" />

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { icon: Shield, text: "No spam, ever" },
            { icon: Leaf, text: "100% Pure Ghee" },
            { icon: Heart, text: "Unsubscribe anytime" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[#FDF6E3]/55">
              <item.icon className="w-3.5 h-3.5 text-[#C9933A] flex-shrink-0" />
              <span className="font-sans text-xs">{item.text}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default NewsletterCTA;

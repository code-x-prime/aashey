"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/utils";

import {
  RiMailSendLine,
  RiShieldCheckLine,
  RiLeafLine,
  RiHeartLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiSparklingLine,
  RiArrowRightLine,
} from "react-icons/ri";

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
      const msg =
        err?.data?.message || err?.message || "Something went wrong. Please try again.";
      setStatus("error");
      setMessage(msg);
    }
  };

  const isSuccess = status === "success" || status === "already";

  return (
    <section className="relative py-0 bg-[#FDF6E3] overflow-hidden">

      {/* ── Full-bleed two-panel layout ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[440px]">

        {/* ── LEFT — dark decorative panel ─────────── */}
        <div className="relative bg-[#3F1F00] flex flex-col items-start justify-center px-8 py-14 md:px-14 md:py-16 overflow-hidden">

          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #C9933A 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Large faint circle accent */}
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-[#C9933A]/10 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-[#C9933A]/10 pointer-events-none" />
          <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-[#C9933A]/8 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 mb-5">
              <span className="w-6 h-px bg-[#C9933A]/50" />
              <span className="font-sans text-[10px] font-semibold tracking-[0.28em] uppercase text-[#C9933A]/70">
                Exclusive Community
              </span>
            </span>

            <h2 className="font-cormorant text-4xl md:text-5xl font-bold text-[#FDF6E3] leading-[1.1] mb-4">
              Join Our <br />
              <span className="italic text-[#C9933A]">Royal Circle</span>
            </h2>

            <p className="font-sans text-[13.5px] text-[#FDF6E3]/55 leading-relaxed max-w-xs mb-8">
              Exclusive recipes, wellness tips, seasonal offers & early access to new arrivals — straight to your inbox.
            </p>

            {/* Trust pills */}
            <div className="flex flex-col gap-2.5">
              {[
                { icon: RiShieldCheckLine, text: "No spam, ever" },
                { icon: RiLeafLine,         text: "100% Pure Ghee updates" },
                { icon: RiHeartLine,        text: "Unsubscribe anytime" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#C9933A]/15 border border-[#C9933A]/25 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-[#C9933A]" />
                  </div>
                  <span className="font-sans text-[12px] text-[#FDF6E3]/50">{text}</span>
                </div>
              ))}
            </div>

            {/* Stat strip */}
            <div className="mt-10 pt-6 border-t border-[#C9933A]/15 flex items-center gap-6">
              {[
                { val: "50K+", label: "Subscribers" },
                { val: "4.9★", label: "Avg Rating" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="font-cormorant font-bold text-2xl text-[#C9933A] leading-none">{val}</p>
                  <p className="font-sans text-[10px] text-[#FDF6E3]/35 mt-0.5 tracking-wide uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — form panel ───────────────────── */}
        <div className="relative bg-white flex flex-col justify-center px-8 py-14 md:px-14 md:py-16">

          {/* Subtle top-right accent */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-[#C9933A]/20 to-transparent" />
            <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-[#C9933A]/20 to-transparent" />
          </div>

          {/* ── Success state ─────────────────────── */}
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#C9933A]/10 border border-[#C9933A]/25 flex items-center justify-center mb-5">
                <RiCheckboxCircleLine className="w-8 h-8 text-[#C9933A]" />
              </div>
              <p className="font-cormorant font-bold text-[#3F1F00] text-3xl mb-2">
                {status === "already" ? "Already with us!" : "Welcome aboard! 🙏"}
              </p>
              <p className="font-sans text-sm text-[#8B6040] leading-relaxed max-w-xs">
                {status === "already"
                  ? "This email is already part of our exclusive community."
                  : "Check your inbox for a warm welcome from the Aashey family."}
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 font-sans text-[12px] text-[#C9933A] hover:text-[#3F1F00] transition-colors underline underline-offset-2"
              >
                Subscribe another email →
              </button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 bg-[#FDF6E3] border border-[#C9933A]/20 rounded-full px-3 py-1 mb-4">
                  <RiSparklingLine className="w-3 h-3 text-[#C9933A]" />
                  <span className="font-sans text-[10px] font-semibold tracking-[0.18em] text-[#C9933A] uppercase">
                    Free to join
                  </span>
                </div>
                <h3 className="font-cormorant text-3xl font-bold text-[#3F1F00] leading-tight">
                  Stay in the loop
                </h3>
                <p className="font-sans text-[13px] text-[#8B6040] mt-1.5">
                  Get early deals & pure ghee wisdom in your inbox.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Name */}
                <div className="relative">
                  <label className="block font-sans text-[11px] font-semibold tracking-wide text-[#5C3A1E] mb-1.5 uppercase">
                    Your Name <span className="text-[#B89070] font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === "loading"}
                    className="w-full h-11 px-4 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60
                      font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070]
                      focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/12 outline-none
                      transition-all disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block font-sans text-[11px] font-semibold tracking-wide text-[#5C3A1E] mb-1.5 uppercase">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <RiMailSendLine className="w-[17px] h-[17px] text-[#C9933A]/60" />
                    </span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === "loading"}
                      className="w-full h-11 pl-10 pr-4 border border-[#C9933A]/25 rounded-xl bg-[#FDF6E3]/60
                        font-sans text-[13.5px] text-[#3F1F00] placeholder:text-[#B89070]
                        focus:border-[#C9933A] focus:ring-2 focus:ring-[#C9933A]/12 outline-none
                        transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Error */}
                {status === "error" && (
                  <p className="font-sans text-[12px] text-red-500">{message}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="w-full h-12 rounded-xl bg-[#3F1F00] hover:bg-[#C9933A] text-[#FDF6E3]
                    font-sans text-[13px] font-semibold tracking-wide
                    flex items-center justify-center gap-2
                    transition-all duration-200 active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {status === "loading" ? (
                    <><RiLoader4Line className="w-4 h-4 animate-spin" /> Subscribing...</>
                  ) : (
                    <>Subscribe Now <RiArrowRightLine className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Privacy note */}
              <p className="font-sans text-[11px] text-[#B89070] text-center mt-4 leading-relaxed">
                By subscribing you agree to receive emails from Aashey. <br className="hidden sm:block" />
                Unsubscribe at any time.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default NewsletterCTA;
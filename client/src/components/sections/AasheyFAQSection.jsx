"use client";

import Link from "next/link";
import { HelpCircle, Mail, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqSections } from "@/lib/static-faqs";

function AnswerBlock({ answer }) {
  return (
    <div className="space-y-3">
      {answer.map((part, index) => {
        if (typeof part === "string") {
          return (
            <p key={index} className="font-sans text-sm leading-relaxed text-[#5C3A1E]">
              {part}
            </p>
          );
        }

        return (
          <ul key={index} className="space-y-2 pl-5 font-sans text-sm leading-relaxed text-[#5C3A1E] list-disc">
            {part.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export function AasheyFAQSection({ compact = false }) {
  return (
    <section className="bg-[#FDF6E3] py-14 md:py-20">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C9933A]/15 border border-[#C9933A]/25 rounded-full mb-5">
            <HelpCircle className="w-4 h-4 text-[#C9933A]" />
            <span className="font-sans text-xs tracking-[0.12em] uppercase font-semibold text-[#C9933A]">
              Aashey A2 Bilona Ghee
            </span>
          </div>
          <h2 className="font-sans text-3xl md:text-5xl font-bold text-[#3F1F00] leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-[#5C3A1E] text-sm md:text-base mt-4">
            From Our Family&apos;s Kitchen to Your Table · Founded 2020 · 1,000+ Happy Families
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-sans text-xl md:text-2xl font-bold text-[#3F1F00] mb-4">
                {section.title}
              </h3>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {section.items.slice(0, compact ? 2 : section.items.length).map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border border-[#C9933A]/15 rounded-lg px-4 bg-white hover:border-[#C9933A]/35 transition-colors"
                  >
                    <AccordionTrigger className="font-sans text-left text-base font-semibold py-4 px-1 hover:no-underline text-[#3F1F00]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-4 pt-1">
                      <AnswerBlock answer={faq.answer} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-10 bg-[#3F1F00] p-7 md:p-9 rounded-lg text-center">
          <h3 className="font-sans text-2xl font-semibold text-[#FDF6E3] mb-3">
            From Our Family&apos;s Kitchen to Your Table
          </h3>
          <p className="font-sans text-[#FDF6E3]/75 text-sm leading-relaxed max-w-2xl mx-auto mb-6">
            Aashey was born from a mother&apos;s love for her family and a commitment to purity that has never wavered. We make every batch with patience, discipline, and respect for tradition.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9933A] text-[#3F1F00] rounded-lg font-sans font-semibold hover:bg-[#F0C96B] transition-colors text-sm"
            >
              Shop A2 Ghee <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:info@aashey.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#C9933A]/40 text-[#FDF6E3] rounded-lg font-sans font-semibold hover:bg-[#C9933A]/10 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" /> info@aashey.com
            </a>
          </div>
          <p className="font-sans text-[#FDF6E3]/45 text-xs mt-6">
            Village Takali, Shiv Shakti Nagar, Chalisgaon, Dist. Jalgaon, Maharashtra - 424102 · FSSAI Lic. No. 21526073000396
          </p>
        </div>
      </div>
    </section>
  );
}

export default AasheyFAQSection;

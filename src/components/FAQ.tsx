import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { FAQItem } from "../types";

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does Schrödinger AI integrate with Google Gemini?",
    answer: "Schrödinger AI leverages Google Gemini 3.6 Flash and Veo cinematic models server-side for high-speed script generation, scene reasoning, dialogue polishing, and concept art generation. All API interactions remain private and securely proxied.",
  },
  {
    question: "Do I retain full commercial rights to created screenplays and media?",
    answer: "Yes, 100%. All scripts, concept art stills, shot lists, and generated assets produced inside Schrödinger AI Studio belong entirely to you and your production company for unlimited commercial use.",
  },
  {
    question: "Can I export scripts directly to Industry Standard software?",
    answer: "Absolutely. Schrödinger AI supports one-click exports to Fountain format (.fountain), standard PDF screenplays, Final Draft XML, and EDL/XML timeline project files compatible with Adobe Premiere Pro and DaVinci Resolve.",
  },
  {
    question: "Is there a limit to how many scripts or concept scenes I can generate?",
    answer: "No! You can generate unlimited script iterations, concept art variations, and shot list breakdowns directly in the AI Studio environment.",
  },
  {
    question: "How does Aura Chat assist during live production?",
    answer: "Aura Chat acts as your on-demand AI co-writer and assistant director. You can ask Aura for instant plot advice, scene restructuring, lighting configurations, or camera lens choices right from the bottom dock.",
  },
];

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="text-center mb-16">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 04 FREQUENTLY ASKED QUESTIONS
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Got Questions? We Have Answers.
        </h2>
        <p className="mt-3 text-base text-[#9A9AA5]">
          Everything you need to know about starting your AI-assisted filmmaking workflow.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? "bg-[#12121A] border-[#5eead4]/40 shadow-lg shadow-[#5eead4]/5"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-sora text-lg font-semibold text-white">
                  {item.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen
                      ? "bg-[#5eead4] border-[#5eead4] text-[#003730]"
                      : "bg-white/5 border-white/10 text-white"
                  }`}
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 sm:px-7 pb-6 text-sm sm:text-base text-[#9A9AA5] leading-relaxed border-t border-white/5 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};

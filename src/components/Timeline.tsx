import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Image, Film, Music, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { TimelineStage } from "../types";

const STAGES: TimelineStage[] = [
  {
    step: "01",
    title: "Concept & Scripting",
    description: "Generate structured Hollywood-grade screenplays, character bibles, scene beats, and loglines with Gemini AI reasoning.",
    timeSaved: "Save 3-4 Weeks",
    features: [
      "Automated scene outline & character arc generation",
      "Real-time dialogue polished with customizable tone",
      "Export to Fountain, PDF, and Final Draft standard formats",
      "Instant translation across 40+ global languages",
    ],
  },
  {
    step: "02",
    title: "Storyboard & Pre-Vis",
    description: "Convert written scenes into key visual frames, camera angle breakdowns, lighting schematics, and blocking guides.",
    timeSaved: "Save 2-3 Weeks",
    features: [
      "AI-generated high-fidelity concept art stills",
      "Interactive 3D camera path pre-visualization",
      "Color palette & volumetric lighting moodboards",
      "Character continuity reference packs",
    ],
  },
  {
    step: "03",
    title: "AI Generation & Render",
    description: "Render high-resolution video clips, digital actor passes, dynamic set extensions, and atmosphere particle FX.",
    timeSaved: "Save 2-3 Months",
    features: [
      "Powered by Veo 3.1 high-definition cinematic model",
      "Configurable 1080p / 4K resolution at 24/60 FPS",
      "Seamless camera motion control (pan, zoom, orbit)",
      "Zero physical location or permit constraints",
    ],
  },
  {
    step: "04",
    title: "Post-Production & Audio",
    description: "Auto-compose cinematic orchestral scores, synthesize realistic voice dubbing, and perform AI color pass grading.",
    timeSaved: "Save 4-6 Weeks",
    features: [
      "Adaptive orchestral score generation matching scene pacing",
      "Automated multi-channel dialogue noise reduction",
      "AI LUT color matching to match famous film aesthetics",
      "One-click EDL export for Premiere Pro & DaVinci Resolve",
    ],
  },
];

export const Timeline: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="timeline" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="text-center mb-16">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 03 PRODUCTION TIMELINE
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          From First Spark to Final Cut
        </h2>
        <p className="mt-3 text-base text-[#9A9AA5] max-w-xl mx-auto">
          Explore how Schrödinger AI streamlines each stage of the filmmaking pipeline.
        </p>
      </div>

      {/* Stage Selector Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {STAGES.map((stage, idx) => {
          const isActive = activeStage === idx;
          return (
            <button
              key={stage.step}
              onClick={() => setActiveStage(idx)}
              className={`text-left p-5 rounded-xl border transition-all relative overflow-hidden group ${
                isActive
                  ? "bg-[#12121A] border-[#5eead4] shadow-lg shadow-[#5eead4]/10"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5eead4] to-[#c084fc]" />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-xs font-bold ${isActive ? "text-[#5eead4]" : "text-[#9A9AA5]"}`}>
                  STAGE {stage.step}
                </span>
                <Clock className={`w-3.5 h-3.5 ${isActive ? "text-[#5eead4]" : "text-[#52525B]"}`} />
              </div>
              <h4 className="font-sora text-base font-semibold text-white group-hover:text-[#5eead4] transition-colors">
                {stage.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Stage Details Card */}
      <div className="glass-panel rounded-2xl border border-white/10 p-8 sm:p-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5eead4]/10 text-[#5eead4] text-xs font-mono font-semibold border border-[#5eead4]/20">
                <span>{STAGES[activeStage].timeSaved}</span>
              </div>

              <h3 className="font-sora text-2xl sm:text-3xl font-semibold text-white">
                {STAGES[activeStage].title}
              </h3>

              <p className="text-base text-[#9A9AA5] leading-relaxed">
                {STAGES[activeStage].description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                {STAGES[activeStage].features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#5eead4] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Visual Graphic */}
            <div className="lg:col-span-1 bg-[#0A0A0F] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
              <div className="w-16 h-16 rounded-2xl bg-[#5eead4]/10 border border-[#5eead4]/30 flex items-center justify-center text-[#5eead4] mb-4">
                {activeStage === 0 && <FileText className="w-8 h-8" />}
                {activeStage === 1 && <Image className="w-8 h-8" />}
                {activeStage === 2 && <Film className="w-8 h-8" />}
                {activeStage === 3 && <Music className="w-8 h-8" />}
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                PIPELINE STAGE {STAGES[activeStage].step}
              </span>
              <p className="text-xs text-[#52525B] mt-2 max-w-xs">
                Fully automated data passing into NLE non-linear editors and timeline compositors.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

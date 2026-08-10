import React from "react";
import { motion } from "motion/react";
import { X, Check, Clock, Zap, Cpu, AlertTriangle } from "lucide-react";

export const Comparison: React.FC = () => {
  return (
    <section id="compare" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#5eead4]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-14">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 01 ARCHITECTURE SHIFT
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Redefining the Film Pipeline
        </h2>
        <p className="mt-3 text-base text-[#9A9AA5] max-w-xl mx-auto">
          Compare legacy manual production bottlenecks with Schrödinger AI's integrated fluid studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Traditional Workflow Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6 sm:p-10 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all duration-300 relative group"
        >
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono text-[#9A9AA5] uppercase tracking-wider block mb-1">Legacy Method</span>
              <h3 className="font-sora text-2xl font-semibold text-white">Traditional Workflow</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">Months of pre-production</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Endless script revisions, location scouting, and manual storyboard drafts.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">High stress, rigid timelines</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Strict set constraints and budget overruns limit creative flexibility.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">Tedious manual edits</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Slow frame-by-frame cutting, visual effect rendering, and sound syncing.</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#9A9AA5]">
            <span>Average turnaround: 12-18 Months</span>
            <span className="text-red-400/80">High Cost</span>
          </div>
        </motion.div>

        {/* AI Assisted Studio Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6 sm:p-10 rounded-2xl border border-[#5eead4]/30 bg-gradient-to-b from-[#12121A] to-[#12121A]/90 hover:border-[#5eead4]/60 transition-all duration-300 relative shadow-2xl shadow-[#5eead4]/10 group"
        >
          {/* Subtle top glow bar */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-[#5eead4] to-[#c084fc]" />

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono text-[#5eead4] uppercase tracking-wider block mb-1">Schrödinger Platform</span>
              <h3 className="font-sora text-2xl font-semibold text-white">AI Assisted Studio</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#5eead4]/10 border border-[#5eead4]/30 flex items-center justify-center text-[#5eead4]">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 flex items-center justify-center text-[#5eead4] flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">24x faster turnaround</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Instant script generation, concept art visualization, and rapid pre-vis.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 flex items-center justify-center text-[#5eead4] flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">Low stress, fluid creativity</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Iterate on plot twists, shot styles, and character arcs with real-time feedback.</p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 flex items-center justify-center text-[#5eead4] flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-medium text-white text-base">Intelligent auto-edits</h4>
                <p className="text-sm text-[#9A9AA5] mt-0.5">Automated scene pacing, AI lighting enhancement, and automatic audio scoring.</p>
              </div>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#5eead4]">
            <span>Average turnaround: Hours/Days</span>
            <span>70% Cost Reduction</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

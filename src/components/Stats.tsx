import React from "react";
import { motion } from "motion/react";

export const Stats: React.FC = () => {
  const statsData = [
    { value: "95%", label: "EFFICIENCY GAIN", desc: "Reduces pre-production turnaround from months to hours" },
    { value: "70%", label: "COST REDUCTION", desc: "Cuts overhead on location scouting, reshoots & manual edits" },
    { value: "3x", label: "OUTPUT VOLUME", desc: "Generates multiple narrative cuts and alternate scene options" },
    { value: "90%", label: "CREATOR SATISFACTION", desc: "Trusted by independent directors & high-volume production houses" },
  ];

  return (
    <section className="py-20 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {statsData.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="text-center group"
          >
            <div className="font-sora text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white mb-2 group-hover:scale-105 transition-transform">
              <span className="text-gradient-cyan-purple">{stat.value}</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-[#9A9AA5] mb-1">
              {stat.label}
            </div>
            <p className="text-xs text-[#52525B] max-w-[200px] mx-auto hidden sm:block">
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

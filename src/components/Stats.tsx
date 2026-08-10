import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const Stats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statsData = [
    { value: "95%", label: "EFFICIENCY GAIN", desc: "Reduces pre-production turnaround from months to hours" },
    { value: "70%", label: "COST REDUCTION", desc: "Cuts overhead on location scouting, reshoots & manual edits" },
    { value: "3x", label: "OUTPUT VOLUME", desc: "Generates multiple narrative cuts and alternate scene options" },
    { value: "90%", label: "CREATOR SATISFACTION", desc: "Trusted by independent directors & high-volume production houses" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="stat-item text-center group"
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
          </div>
        ))}
      </div>
    </section>
  );
};

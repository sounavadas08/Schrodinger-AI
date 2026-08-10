import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Sparkles, ArrowRight, Play, Film } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
  onTryStudio: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onTryStudio }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.fromTo(".hero-badge", 
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
      .fromTo(".hero-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.3"
      )
      .fromTo(".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(".hero-buttons",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      )
      .fromTo(".hero-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.2"
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#5eead4]/15 via-[#a855f7]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-radial from-[#ec4899]/10 via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2a15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
        {/* Top Tagline Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8 text-xs font-mono uppercase tracking-widest text-[#5eead4]">
          <Film className="w-3.5 h-3.5 text-[#5eead4]" />
          <span>Symphony of Human + AI Storytelling</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="hero-title text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-sora font-semibold tracking-tight text-white leading-[1.08] mb-6">
          schrodinger Ai is the Future of{" "}
          <span className="block sm:inline text-gradient-purple-magenta relative">
            Entertainment
            <span className="absolute -inset-1 bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/20 blur-xl -z-10 rounded-full" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-[#9A9AA5] font-normal leading-relaxed mb-8 sm:mb-10">
          Accelerating filmmakers and storytellers by seamlessly blending artificial
          intelligence precision with human creative intuition.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base hover:bg-[#b5fff0] transition-all duration-300 shadow-lg shadow-[#5eead4]/20 hover:scale-105 flex items-center justify-center gap-2 group min-h-[48px]"
          >
            <span>Explore AI</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onTryStudio}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/[0.05] border border-white/15 text-white font-medium text-base hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 group min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-[#5eead4]" />
            <span>Try AI Studio</span>
          </button>
        </div>

        {/* Interactive Reel Indicator */}
        <div className="hero-indicator mt-16 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 text-xs text-[#9A9AA5] font-mono">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]" />
          </span>
          <span>POWERED BY GEMINI 3.6 &amp; VEO CINEMATIC CORE</span>
        </div>
      </div>
    </section>
  );
};

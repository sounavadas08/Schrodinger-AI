import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { gsap } from "gsap";
import { Film, Image as ImageIcon, Video, Sparkles, Wand2 } from "lucide-react";

const tools = [
  {
    id: "script",
    title: "Script Generator",
    description: "Generate professional screenplays with AI",
    icon: Film,
    color: "from-[#5eead4] to-[#c084fc]",
    section: "studio",
  },
  {
    id: "concept",
    title: "Concept Art",
    description: "Create stunning cinematic visuals",
    icon: ImageIcon,
    color: "from-[#c084fc] to-[#ec4899]",
    section: "studio",
  },
  {
    id: "video",
    title: "Video Generator",
    description: "Generate video from text prompts",
    icon: Video,
    color: "from-[#ec4899] to-[#5eead4]",
    section: "video-generator",
  },
  {
    id: "music",
    title: "Music Writer",
    description: "Compose original AI music tracks",
    icon: Sparkles,
    color: "from-[#5eead4] to-[#a855f7]",
    section: "music-writer",
  },
  {
    id: "weather",
    title: "Weather AI",
    description: "Intelligent weather forecasting",
    icon: Wand2,
    color: "from-[#a855f7] to-[#5eead4]",
    section: "weather-predictor",
  },
  {
    id: "converter",
    title: "Audio Converter",
    description: "Extract MP3 from YouTube",
    icon: Video,
    color: "from-[#ec4899] to-[#c084fc]",
    section: "youtube-mp3",
  },
];

export const ToolShowcase: React.FC<{ onNavigate: (id: string) => void }> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tool-card",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".tools-section",
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="tools-section py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
            / AI TOOLKIT
          </span>
          <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight mb-4">
            Your Creative Arsenal
          </h2>
          <p className="text-base text-[#9A9AA5] max-w-xl mx-auto">
            Explore our comprehensive suite of AI-powered tools designed for modern filmmakers and creators.
          </p>
        </div>
      </div>

      <div ref={containerRef} className="horizontal-scroll-container flex gap-6 overflow-x-auto pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => onNavigate(tool.section)}
            className="tool-card horizontal-scroll-item w-[300px] sm:w-[340px] liquid-glass-card liquid-glass-hover p-6 text-left group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} p-[1px] mb-5`}>
              <div className="w-full h-full rounded-2xl bg-[#0A0A0F] flex items-center justify-center">
                <tool.icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="font-sora text-xl font-semibold text-white mb-2 group-hover:text-[#5eead4] transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-[#9A9AA5] leading-relaxed mb-4">
              {tool.description}
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#5eead4]">
              <span>Explore Tool</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

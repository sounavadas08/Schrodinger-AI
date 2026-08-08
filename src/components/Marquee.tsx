import React from "react";
import { ChevronLeft, Sparkles } from "lucide-react";

export const Marquee: React.FC = () => {
  const items = [
    "FILMMAKING",
    "SCRIPTWRITING",
    "VIDEO EDITING",
    "CONCEPT ART",
    "SOUND DESIGN",
    "POST-PRODUCTION",
    "STORYBOARDING",
    "COLOR GRADING",
  ];

  return (
    <div className="w-full bg-[#0E0E13] border-y border-white/10 py-5 overflow-hidden select-none relative z-20">
      <div className="animate-marquee flex items-center whitespace-nowrap gap-12">
        {[...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-12">
            <span className="font-sora font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-wider text-white/80 hover:text-[#5eead4] transition-colors cursor-default">
              {item}
            </span>
            <ChevronLeft className="w-6 h-6 text-[#5eead4]/70 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

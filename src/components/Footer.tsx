import React from "react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#08080C] border-t border-white/10 pt-16 pb-24 text-sm text-[#9A9AA5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-sora font-bold text-xl text-white">schrodinger <span className="text-[#5eead4] font-normal">Ai</span></span>
          </div>
          <p className="text-xs text-[#9A9AA5] max-w-sm leading-relaxed">
            Accelerating filmmakers and storytellers by seamlessly blending artificial intelligence precision with human creative intuition.
          </p>
          <p className="text-xs text-[#52525B] font-mono pt-4">
            © 2026 schrodinger Ai Studio. All rights reserved.
          </p>
        </div>

        <div>
          <h5 className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">PLATFORM</h5>
          <ul className="space-y-2 sm:space-y-2.5 text-xs font-mono">
            {["studio", "video-generator", "music-writer", "weather-predictor", "youtube-mp3", "compare", "timeline", "faq"].map((id) => (
              <li key={id}>
                <button onClick={() => onNavigate(id)} className="hover:text-white transition-colors py-1 min-h-[32px]">
                  {id === "studio" && "Studio"}
                  {id === "video-generator" && "Video Generator"}
                  {id === "music-writer" && "Music Writer"}
                  {id === "weather-predictor" && "Weather Predictor"}
                  {id === "youtube-mp3" && "YouTube Converter"}
                  {id === "compare" && "Compare"}
                  {id === "timeline" && "Timeline"}
                  {id === "faq" && "FAQ"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h5 className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">RESOURCES</h5>
          <ul className="space-y-2.5 text-xs font-mono">
            <li><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#contact" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

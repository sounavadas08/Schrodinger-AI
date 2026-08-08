import React from "react";

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#08080C] border-t border-white/10 pt-16 pb-24 text-sm text-[#9A9AA5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
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

        {/* Navigation Links */}
        <div>
          <h5 className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">PLATFORM</h5>
          <ul className="space-y-2.5 text-xs font-mono">
            <li>
              <button onClick={() => onNavigate("studio")} className="hover:text-white transition-colors">Studio</button>
            </li>
            <li>
              <button onClick={() => onNavigate("video-generator")} className="hover:text-white transition-colors">Video Generator</button>
            </li>
            <li>
              <button onClick={() => onNavigate("music-writer")} className="hover:text-white transition-colors">Music Writer</button>
            </li>
            <li>
              <button onClick={() => onNavigate("weather-predictor")} className="hover:text-white transition-colors">Weather Predictor</button>
            </li>
            <li>
              <button onClick={() => onNavigate("youtube-mp3")} className="hover:text-white transition-colors">YouTube Converter</button>
            </li>
            <li>
              <button onClick={() => onNavigate("compare")} className="hover:text-white transition-colors">Compare</button>
            </li>
            <li>
              <button onClick={() => onNavigate("timeline")} className="hover:text-white transition-colors">Timeline</button>
            </li>
            <li>
              <button onClick={() => onNavigate("faq")} className="hover:text-white transition-colors">FAQ</button>
            </li>
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

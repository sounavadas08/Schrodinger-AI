import React, { useState, useEffect } from "react";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "studio", label: "Studio" },
    { id: "compare", label: "Compare" },
    { id: "timeline", label: "Timeline" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0F]/85 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate("hero")}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#5eead4]/50 transition-colors">
            <span className="font-sora font-bold text-lg text-white group-hover:text-[#5eead4] transition-colors">
              s
            </span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5eead4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5eead4]"></span>
            </span>
          </div>
          <span className="font-sora font-semibold text-lg tracking-tight text-white group-hover:text-white/90">
            schrodinger <span className="font-normal text-[#5eead4] text-base">Ai</span>
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 bg-white/[0.03] px-6 py-2 rounded-full border border-white/[0.08] backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive ? "text-white" : "text-[#9A9AA5] hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5eead4] to-[#c084fc] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate("studio")}
            className="relative group overflow-hidden rounded-full p-[1px] font-medium text-sm focus:outline-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#5eead4] via-[#c084fc] to-[#5eead4] rounded-full group-hover:opacity-100 transition-opacity animate-gradient" />
            <span className="relative px-5 py-2.5 rounded-full bg-[#0E0E13] text-white flex items-center gap-2 group-hover:bg-[#131318] transition-colors">
              <span>Try AI Studio</span>
              <Sparkles className="w-4 h-4 text-[#5eead4] group-hover:rotate-12 transition-transform" />
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0D0D12] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-base font-medium text-[#E4E1E9] hover:bg-white/5 hover:text-[#5eead4] transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onNavigate("studio");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#5eead4] to-[#c084fc] text-[#0A0A0F] font-semibold flex items-center justify-center gap-2"
                >
                  <span>Try AI Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Comparison } from "./components/Comparison";
import { LiveStudio } from "./components/LiveStudio";
import { Stats } from "./components/Stats";
import { Timeline } from "./components/Timeline";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { AuraChat } from "./components/AuraChat";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E4E1E9] font-sans relative overflow-x-hidden selection:bg-[#5eead4]/30 selection:text-[#5eead4]">
      {/* Navigation Header */}
      <Navbar onNavigate={scrollToSection} activeSection={activeSection} />

      {/* Main Page Content */}
      <main>
        {/* Hero Banner */}
        <Hero
          onExplore={() => scrollToSection("compare")}
          onTryStudio={() => scrollToSection("studio")}
        />

        {/* Ticker Marquee Banner */}
        <Marquee />

        {/* Traditional vs AI Assisted Comparison Cards */}
        <Comparison />

        {/* Interactive Live AI Studio (Script Generator, Concept Art, Shot List) */}
        <LiveStudio />

        {/* Impact Statistics */}
        <Stats />

        {/* Filmmaking Production Timeline */}
        <Timeline />

        {/* Frequently Asked Questions */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer onNavigate={scrollToSection} />

      {/* Floating / Docked Aura Assistant Chat Widget */}
      <AuraChat />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Comparison } from "./components/Comparison";
import { LiveStudio } from "./components/LiveStudio";
import { Stats } from "./components/Stats";
import { Timeline } from "./components/Timeline";
import { ToolShowcase } from "./components/ToolShowcase";
import { VideoGenerator } from "./components/VideoGenerator";
import { MusicWriter } from "./components/MusicWriter";
import { WeatherPredictor } from "./components/WeatherPredictor";
import { YouTubeToMp3 } from "./components/YouTubeToMp3";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { AuraChat } from "./components/AuraChat";
import { CustomCursor } from "./components/CustomCursor";
import { UserDashboard } from "./components/UserDashboard";
import { useUser } from "./context/UserContext";

function AppContent() {
  const [activeSection, setActiveSection] = useState("hero");
  const { trackSection } = useUser();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "dashboard") {
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "studio", "compare", "timeline", "video-generator", "music-writer", "weather-predictor", "youtube-mp3", "faq"];
      const scrollPos = window.scrollY + window.innerHeight / 2;
      
      for (const id of sections) {
        const elem = document.getElementById(id);
        if (elem) {
          const top = elem.offsetTop;
          const bottom = top + elem.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#E4E1E9] font-sans relative overflow-x-hidden selection:bg-[#5eead4]/30 selection:text-[#5eead4]">
      <CustomCursor />
      <UserDashboard />

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

        {/* Tools Showcase - Horizontal Scroll */}
        <ToolShowcase onNavigate={scrollToSection} />

        {/* Traditional vs AI Assisted Comparison Cards */}
        <Comparison />

        {/* Interactive Live AI Studio (Script Generator, Concept Art, Shot List) */}
        <LiveStudio />

        {/* Impact Statistics */}
        <Stats />

        {/* Filmmaking Production Timeline */}
        <Timeline />

        {/* AI Video Generator */}
        <VideoGenerator />

        {/* AI Music Writer */}
        <MusicWriter />

        {/* AI Weather Predictor */}
        <WeatherPredictor />

        {/* YouTube to MP3 Converter */}
        <YouTubeToMp3 />

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

export default function App() {
  return <AppContent />;
}

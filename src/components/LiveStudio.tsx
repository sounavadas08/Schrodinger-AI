import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Copy, Download, RefreshCw, Film, Video, Check, Layers, Play } from "lucide-react";
import { ScriptPreset } from "../types";

const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "suspense",
    label: "A suspense short film",
    prompt: "A suspense short film set in an isolated lighthouse during a temporal anomaly.",
    genre: "Thriller",
  },
  {
    id: "cooking",
    label: "A cozy cooking Reel",
    prompt: "A cozy cinematic cooking Reel featuring hand-rolled matcha gnocchi in a sunlit Kyoto kitchen.",
    genre: "Lifestyle",
  },
  {
    id: "cyberpunk",
    label: "A cyberpunk music video",
    prompt: "A cyberpunk music video intro with neon rain, holographic dragons, and high-speed hovercraft racing.",
    genre: "Sci-Fi",
  },
  {
    id: "scifi",
    label: "Sci-fi teaser trailer",
    prompt: "A sci-fi teaser trailer for a deep space exploration ship discovering an ancient Dyson sphere.",
    genre: "Sci-Fi",
  },
];

export const LiveStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"script" | "scene">("script");
  
  // Script Generator State
  const [scriptPrompt, setScriptPrompt] = useState("I want a suspense short film...");
  const [scriptOutput, setScriptOutput] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Scene Director State
  const [scenePrompt, setScenePrompt] = useState("A climax confrontation between rival hackers in a subterranean server vault");
  const [sceneShots, setSceneShots] = useState<any[] | null>(null);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  // Handle Script Generation
  const handleGenerateScript = async () => {
    if (!scriptPrompt.trim()) return;
    setIsGeneratingScript(true);
    setScriptOutput("");

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: scriptPrompt }),
      });
      const data = await res.json();
      if (data.script) {
        setScriptOutput(data.script);
      } else {
        setScriptOutput("Error generating script. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setScriptOutput("Failed to connect to AI Studio server.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handle Scene Breakdown Generation
  const handleGenerateScene = async () => {
    if (!scenePrompt.trim()) return;
    setIsGeneratingScene(true);
    
    // Generate shot breakdown list
    setTimeout(() => {
      setSceneShots([
        { shotNumber: "01", angle: "EXT. WIDE ANGLE - HIGH CRANE", description: "Establishes the sprawling subterranean server vault. Steam vents pulse rhythmically as blue cables run like veins across concrete floor.", lighting: "Volumetric Teal Rim", length: "4.5s" },
        { shotNumber: "02", angle: "INT. MEDIUM TRACKING - SLIDER", description: "Tracks HORA (20s, leather jacket, glowing cybernetic eye) moving swiftly between cooling racks with a handheld neural decoder.", lighting: "Amber Accent Key", length: "3.2s" },
        { shotNumber: "03", angle: "CLOSE-UP - ANAMORPHIC 50MM", description: "Hora's thumb flicks a switch. Reflection of liquid nitrogen frost spreading across the glass door of the mainframe.", lighting: "High Contrast Shadow", length: "2.8s" },
        { shotNumber: "04", angle: "OVER-THE-SHOULDER - DUTCH TILT", description: "A shadowy figure steps out from the server racks, holding an EMP pulse emitter. The room's ambient light turns crimson.", lighting: "Pulsing Red Emergency Strobe", length: "5.0s" },
      ]);
      setIsGeneratingScene(false);
    }, 1200);
  };

  const handleCopyScript = () => {
    if (!scriptOutput) return;
    navigator.clipboard.writeText(scriptOutput);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    if (!scriptOutput) return;
    const blob = new Blob([scriptOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schrodinger-script.fountain";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="studio" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 02 LIVE AI STUDIO
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Play with your new creative partner.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Real AI, right here, right now. Generate a full script or break your scenes into technical shot lists.
        </p>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex p-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md flex-shrink-0">
          <button
            onClick={() => setActiveTab("script")}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              activeTab === "script"
                ? "bg-[#5eead4] text-[#003730] shadow-lg shadow-[#5eead4]/20"
                : "text-[#9A9AA5] hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            <span className="whitespace-nowrap">Script Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("scene")}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-medium transition-all min-h-[44px] ${
              activeTab === "scene"
                ? "bg-[#5eead4] text-[#003730] shadow-lg shadow-[#5eead4]/20"
                : "text-[#9A9AA5] hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="whitespace-nowrap">Scene Shot List</span>
          </button>
        </div>
      </div>

      {/* Main Studio Interface Box */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* TAB 1: SCRIPT GENERATOR */}
          {activeTab === "script" && (
            <motion.div
              key="script-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column - Input Controls */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Film className="w-4 h-4 text-[#5eead4]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                      SCRIPT GENERATOR
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={scriptPrompt}
                      onChange={(e) => setScriptPrompt(e.target.value)}
                      placeholder="I want a suspense short film..."
                      rows={5}
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] focus:ring-1 focus:ring-[#5eead4] transition-all resize-none font-sans text-base"
                    />
                  </div>

                  {/* Preset Prompt Chips */}
                  <div className="mt-4">
                    <span className="text-xs text-[#9A9AA5] font-mono block mb-2">QUICK IDEAS:</span>
                    <div className="flex flex-wrap gap-2">
                      {SCRIPT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setScriptPrompt(preset.prompt);
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            scriptPrompt === preset.prompt
                              ? "bg-[#5eead4]/20 border-[#5eead4] text-[#5eead4]"
                              : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white hover:border-white/20"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript || !scriptPrompt.trim()}
                  className="w-full py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5eead4]/20"
                >
                  {isGeneratingScript ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Writing Screenplay with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate script</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column - Screenplay Output View */}
              <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
                {scriptOutput ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#9A9AA5]">
                      <span className="text-[#5eead4]">STATUS: GENERATED</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyScript}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Copy script"
                        >
                          {copiedScript ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedScript ? "Copied" : "Copy"}</span>
                        </button>

                        <button
                          onClick={handleDownloadScript}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                          title="Download Fountain Screenplay"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto pr-2 font-mono text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-[#5eead4]/30 selection:text-[#5eead4]">
                      {scriptOutput}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#52525B]">
                    <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 text-[#9A9AA5]">
                      <Film className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-mono text-sm text-[#9A9AA5]">Your screenplay appears here</p>
                    <p className="text-xs text-[#52525B] max-w-xs mt-1">
                      Type a prompt or choose a quick idea on the left to generate formatted scenes.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SCENE SHOT LIST */}
          {activeTab === "scene" && (
            <motion.div
              key="scene-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-4 h-4 text-[#5eead4]" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                      SCENE DIRECTOR
                    </span>
                  </div>

                  <textarea
                    value={scenePrompt}
                    onChange={(e) => setScenePrompt(e.target.value)}
                    placeholder="Describe a dramatic scene to break down..."
                    rows={5}
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] text-base resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateScene}
                  disabled={isGeneratingScene || !scenePrompt.trim()}
                  className="w-full py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50"
                >
                  {isGeneratingScene ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Building Shot List...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Map Shot Breakdown</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column - Shot List Cards */}
              <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/10 rounded-xl p-6 min-h-[380px]">
                {sceneShots ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs text-[#9A9AA5]">
                      <span className="text-[#5eead4]">SHOT SEQUENCE (4 SHOTS)</span>
                      <span>TOTAL DURATION: 15.5S</span>
                    </div>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                      {sceneShots.map((shot) => (
                        <div key={shot.shotNumber} className="bg-white/[0.03] border border-white/10 rounded-lg p-4 hover:border-[#5eead4]/40 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[#5eead4]">SHOT #{shot.shotNumber}</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white">{shot.length}</span>
                          </div>
                          <h5 className="font-mono text-xs font-semibold text-white mb-1">{shot.angle}</h5>
                          <p className="text-xs text-gray-300 leading-relaxed mb-2">{shot.description}</p>
                          <div className="text-[11px] font-mono text-[#9A9AA5] flex items-center gap-1">
                            <span>LIGHTING:</span>
                            <span className="text-[#c084fc]">{shot.lighting}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#52525B]">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-mono text-sm text-[#9A9AA5]">Shot list sequence appears here</p>
                    <p className="text-xs text-[#52525B] max-w-xs mt-1">
                      Auto-generate technical camera angles, movement directions, and lighting setups for any scene.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

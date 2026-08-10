import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Download, RefreshCw, Image as ImageIcon, Check } from "lucide-react";

const STYLES = ["Cinematic 35mm", "Cyberpunk Noir", "Anime Masterpiece", "Photorealistic", "Dark Fantasy"];
const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3"];

export const ConceptArt: React.FC = () => {
  const [imagePrompt, setImagePrompt] = useState(
    "A mysterious silhouette on a neon-lit rain soaked rooftop over a futuristic megacity, cinematic lighting, 8k"
  );
  const [imageStyle, setImageStyle] = useState("Cinematic 35mm");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${imagePrompt}, style: ${imageStyle}`, aspectRatio }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data.error || "Image generation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to AI Studio server.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <section id="concept-art" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 03 AI CONCEPT ART
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Generate cinematic concept art.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Render high-fidelity film stills and storyboard visual concepts in seconds — powered by Hugging Face FLUX.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-[#5eead4]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                  CONCEPT ART GENERATOR
                </span>
              </div>

              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe your scene artwork..."
                rows={4}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] transition-all text-base resize-none"
              />
            </div>

            {/* Style Selector */}
            <div>
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">CINEMATIC STYLE:</span>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setImageStyle(style)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      imageStyle === style
                        ? "bg-[#5eead4] text-[#003730] border-[#5eead4] font-semibold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">ASPECT RATIO:</span>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      aspectRatio === ratio
                        ? "bg-white/15 border-[#5eead4] text-white font-bold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !imagePrompt.trim()}
              className="w-full py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Rendering Concept Art...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Concept Art</span>
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}
          </div>

          {/* Right Column - Image Preview */}
          <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden">
            {imageUrl ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center group">
                <img
                  src={imageUrl}
                  alt="Generated Concept Art"
                  referrerPolicy="no-referrer"
                  className="max-h-[320px] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
                />
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open Fullscreen</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-[#52525B]">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-mono text-sm text-[#9A9AA5]">Your concept art appears here</p>
                <p className="text-xs text-[#52525B] max-w-xs mt-1">
                  Render high-fidelity film stills and storyboard visual concepts in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

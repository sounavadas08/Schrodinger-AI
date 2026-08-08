import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Video, Clock, MonitorPlay, Copy, Download, RefreshCw, Check, Play } from "lucide-react";

const DURATIONS = ["5s", "10s", "30s", "60s"];
const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3"];
const STYLES = ["Cinematic", "Anime", "3D Animation", "Realistic", "Cyberpunk"];

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("10s");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [style, setStyle] = useState("Cinematic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 12;
      });
    }, 400);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration, aspectRatio, style }),
      });
      const data = await res.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoTitle(data.title || "Generated Video");
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 600);
    }
  };

  const handleCopyPrompt = () => {
    if (!videoTitle) return;
    navigator.clipboard.writeText(videoTitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="video-generator" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 05 AI VIDEO GENERATOR
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Generate cinematic video from text.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Transform your ideas into high-fidelity video clips with AI-driven motion and cinematic composition.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-4 h-4 text-[#5eead4]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                  VIDEO GENERATOR
                </span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video scene you want to generate..."
                rows={5}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] focus:ring-1 focus:ring-[#5eead4] transition-all resize-none font-sans text-base"
              />
            </div>

            <div>
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">DURATION:</span>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      duration === d
                        ? "bg-white/15 border-[#5eead4] text-white font-bold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">ASPECT RATIO:</span>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      aspectRatio === r
                        ? "bg-white/15 border-[#5eead4] text-white font-bold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">STYLE:</span>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      style === s
                        ? "bg-[#5eead4] text-[#003730] border-[#5eead4] font-semibold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5eead4]/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating Video ({Math.min(100, Math.round(progress))}%)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 min-h-[380px] flex flex-col items-center justify-center relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0A0A0F]/80 backdrop-blur-sm">
                <div className="w-20 h-20 rounded-full border-4 border-[#5eead4]/20 border-t-[#5eead4] animate-spin mb-4" />
                <p className="font-mono text-sm text-[#5eead4] mb-1">RENDERING CINEMATIC FOOTAGE</p>
                <p className="text-xs text-[#9A9AA5]">Style: {style} | Duration: {duration} | Ratio: {aspectRatio}</p>
                <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-[#5eead4] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              </div>
            )}

            {videoUrl && !isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%230A0A0F' width='1920' height='1080'/%3E%3C/svg%3E"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-mono text-[#9A9AA5]">{videoTitle}</span>
                  <button
                    onClick={handleCopyPrompt}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    title="Copy title"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={videoUrl}
                    download
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              </div>
            ) : !isGenerating ? (
              <div className="text-center p-8 text-[#52525B]">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 text-[#9A9AA5]">
                  <Play className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-mono text-sm text-[#9A9AA5]">Your video appears here</p>
                <p className="text-xs text-[#52525B] max-w-xs mt-1">
                  Describe a cinematic scene to generate AI-driven motion footage with professional composition.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

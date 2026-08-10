import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Music, Copy, Download, RefreshCw, Play, Pause, Check, Clock, Disc } from "lucide-react";

const GENRES = ["Cinematic", "Electronic", "Orchestral", "Lo-fi", "Ambient", "Jazz", "Rock", "Hip-Hop"];
const MOODS = ["Epic", "Melancholic", "Energetic", "Calm", "Dark", "Uplifting", "Tense", "Romantic"];
const DURATIONS = ["0:30", "1:00", "2:00", "3:00", "5:00"];
const INSTRUMENTS = ["Piano", "Strings", "Brass", "Percussion", "Synth", "Guitar", "Drums", "Bass", "Woodwinds", "Vocals"];

export const MusicWriter: React.FC = () => {
  const [genre, setGenre] = useState("Cinematic");
  const [mood, setMood] = useState("Epic");
  const [duration, setDuration] = useState("2:00");
  const [instruments, setInstruments] = useState<string[]>(["Strings", "Percussion"]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [trackMeta, setTrackMeta] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleInstrument = (inst: string) => {
    setInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseDurationToSeconds = (d: string) => {
    const parts = d.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const handlePlayPause = () => {
    if (!trackMeta) return;
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const total = parseDurationToSeconds(trackMeta.duration);
          if (prev >= total) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            return total;
          }
          return prev + 1;
        });
      }, 1000);
      setIsPlaying(true);
    }
  };

  const handleGenerate = async () => {
    if (!genre || !mood) return;
    setIsGenerating(true);
    setTrackMeta(null);
    setCurrentTime(0);
    setIsPlaying(false);

    try {
      const res = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, mood, duration, instruments, prompt }),
      });
      const data = await res.json();
      if (data.track) {
        setTrackMeta(data.track);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!trackMeta) return;
    const text = `Title: ${trackMeta.title}\nGenre: ${trackMeta.genre}\nMood: ${trackMeta.mood}\nBPM: ${trackMeta.bpm}\nKey: ${trackMeta.key}\nTime Sig: ${trackMeta.timeSignature}\nDuration: ${trackMeta.duration}\nInstruments: ${trackMeta.instruments.join(", ")}\n\n${trackMeta.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!trackMeta) return;
    const blob = new Blob([`Title: ${trackMeta.title}\nGenre: ${trackMeta.genre}\nMood: ${trackMeta.mood}\nBPM: ${trackMeta.bpm}\nKey: ${trackMeta.key}\nTime Sig: ${trackMeta.timeSignature}\nDuration: ${trackMeta.duration}\nInstruments: ${trackMeta.instruments.join(", ")}\n\n${trackMeta.description}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schrodinger-track-${trackMeta.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="music-writer" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#a855f7]/10 via-[#ec4899]/10 to-[#5eead4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 06 AI MUSIC WRITER
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Compose original music with AI.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Define genre, mood, duration, and instrumentation to generate unique musical compositions.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-4 h-4 text-[#5eead4]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                  MUSIC COMPOSER
                </span>
              </div>

              <div className="mb-4">
                <span className="text-xs font-mono text-[#9A9AA5] block mb-2">GENRE:</span>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        genre === g
                          ? "bg-[#5eead4] text-[#003730] border-[#5eead4] font-semibold"
                          : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-mono text-[#9A9AA5] block mb-2">MOOD:</span>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        mood === m
                          ? "bg-[#c084fc] text-white border-[#c084fc] font-semibold"
                          : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
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

              <div className="mb-4">
                <span className="text-xs font-mono text-[#9A9AA5] block mb-2">INSTRUMENTATION:</span>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map((inst) => (
                    <button
                      key={inst}
                      onClick={() => toggleInstrument(inst)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        instruments.includes(inst)
                          ? "bg-[#ec4899]/20 border-[#ec4899] text-[#ec4899]"
                          : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-mono text-[#9A9AA5] block mb-2">ADDITIONAL NOTES:</span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe specific musical motifs, tempo changes, or thematic elements..."
                  rows={3}
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-4 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] text-base resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#5eead4]/20 min-h-[48px]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Composing Track...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Music</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0A0A0F] border border-white/10 rounded-xl p-6 min-h-[380px] flex flex-col">
            {trackMeta ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-[#9A9AA5]">
                  <span className="text-[#5eead4]">STATUS: COMPOSED</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-[#5eead4] text-[#003730] flex items-center justify-center hover:bg-[#b5fff0] transition-colors shadow-lg shadow-[#5eead4]/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <p className="font-sora text-base font-semibold text-white">{trackMeta.title}</p>
                    <p className="text-xs text-[#9A9AA5] font-mono">
                      {trackMeta.bpm} BPM | {trackMeta.key} | {trackMeta.timeSignature}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#9A9AA5]">
                    {formatTime(currentTime)} / {trackMeta.duration}
                  </span>
                </div>

                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5eead4] rounded-full transition-all duration-1000"
                    style={{ width: `${(currentTime / parseDurationToSeconds(trackMeta.duration)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                    <span className="text-[#9A9AA5] font-mono block mb-1">GENRE</span>
                    <span className="text-white font-semibold">{trackMeta.genre}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                    <span className="text-[#9A9AA5] font-mono block mb-1">MOOD</span>
                    <span className="text-white font-semibold">{trackMeta.mood}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                    <span className="text-[#9A9AA5] font-mono block mb-1">INSTRUMENTS</span>
                    <span className="text-white font-semibold">{trackMeta.instruments.join(", ")}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                    <span className="text-[#9A9AA5] font-mono block mb-1">FORMAT</span>
                    <span className="text-white font-semibold">WAV 48kHz / 24bit</span>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4">
                  <span className="text-[#9A9AA5] font-mono text-xs block mb-2">COMPOSITION NOTES</span>
                  <p className="text-sm text-gray-200 leading-relaxed">{trackMeta.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#52525B]">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 text-[#9A9AA5]">
                  <Disc className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-mono text-sm text-[#9A9AA5]">Your track appears here</p>
                <p className="text-xs text-[#52525B] max-w-xs mt-1">
                  Select genre, mood, and instruments to generate an original AI-composed musical piece.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

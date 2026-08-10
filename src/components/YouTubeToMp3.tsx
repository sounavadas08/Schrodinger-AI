import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Link2, Music, CheckCircle2, AlertCircle, RefreshCw, Play, FileAudio } from "lucide-react";
import { ConversionJob } from "../types";

const BITRATES = ["128kbps", "192kbps", "256kbps", "320kbps"];

export const YouTubeToMp3: React.FC = () => {
  const [url, setUrl] = useState("");
  const [bitrate, setBitrate] = useState("192kbps");
  const [isConverting, setIsConverting] = useState(false);
  const [jobs, setJobs] = useState<ConversionJob[]>([]);

  const handleConvert = async () => {
    if (!url.trim()) return;
    const jobId = Date.now().toString();
    const newJob: ConversionJob = {
      id: jobId,
      url,
      title: "Fetching video info...",
      duration: "--",
      bitrate,
      status: "queued",
    };

    setJobs((prev) => [newJob, ...prev]);
    setIsConverting(true);

    try {
      const res = await fetch("/api/convert-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, bitrate }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: "error" as const, error: data.error || "Conversion failed." }
              : job
          )
        );
        return;
      }

      // Seed the job with metadata, then poll until the conversion completes.
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? {
                ...job,
                title: data.title || "YouTube Audio",
                duration: data.duration || "0:00",
                status: "processing" as const,
                jobRef: data.jobId,
              }
            : job
        )
      );

      const poll = async () => {
        try {
          const statusRes = await fetch(`/api/convert-youtube/${data.jobId}`);
          const status = await statusRes.json();
          if (status.status === "completed") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === jobId
                  ? { ...job, status: "completed" as const, downloadUrl: status.downloadUrl }
                  : job
              )
            );
          } else if (status.status === "error") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === jobId
                  ? { ...job, status: "error" as const, error: status.error }
                  : job
              )
            );
          } else {
            // Still processing — poll again shortly.
            setTimeout(poll, 1500);
          }
        } catch {
          setTimeout(poll, 2000);
        }
      };
      poll();
    } catch (err) {
      console.error(err);
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "error" as const, error: "Failed to connect to conversion server." }
            : job
        )
      );
    } finally {
      setIsConverting(false);
    }
  };

  const clearJobs = () => setJobs([]);

  return (
    <section id="youtube-mp3" className="py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#5eead4]/10 via-[#a855f7]/10 to-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#5eead4] px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 inline-block mb-3">
          / 08 YOUTUBE TO MP3
        </span>
        <h2 className="font-sora text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Extract audio from YouTube.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-[#9A9AA5]">
          Convert YouTube videos to high-quality MP3 audio files with customizable bitrate selection.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-[#5eead4]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#9A9AA5]">
                AUDIO EXTRACTOR
              </span>
            </div>

            <div className="relative mb-4">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AA5]" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube video URL here..."
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] text-base"
              />
            </div>

            <div className="mb-4">
              <span className="text-xs font-mono text-[#9A9AA5] block mb-2">BITRATE:</span>
              <div className="flex gap-2">
                {BITRATES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBitrate(b)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      bitrate === b
                        ? "bg-white/15 border-[#5eead4] text-white font-bold"
                        : "bg-white/[0.03] border-white/10 text-[#9A9AA5] hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                disabled={isConverting || !url.trim()}
                className="flex-1 py-4 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#5eead4]/20 min-h-[48px]"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Extracting Audio...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Convert to MP3</span>
                  </>
                )}
              </button>
              {jobs.length > 0 && (
                <button
                  onClick={clearJobs}
                  className="px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {jobs.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-mono text-[#9A9AA5] uppercase tracking-widest">Conversion Queue</p>
              <AnimatePresence>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0F] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <FileAudio className="w-5 h-5 text-[#5eead4]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                        <p className="text-xs text-[#9A9AA5] font-mono">{job.duration} | {job.bitrate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job.status === "queued" && (
                        <span className="text-xs font-mono text-[#9A9AA5] px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          QUEUED
                        </span>
                      )}
                      {job.status === "processing" && (
                        <span className="text-xs font-mono text-[#5eead4] px-3 py-1 rounded-full bg-[#5eead4]/10 border border-[#5eead4]/20 flex items-center gap-1.5">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          PROCESSING
                        </span>
                      )}
                      {job.status === "completed" && job.downloadUrl && (
                        <a
                          href={job.downloadUrl}
                          download
                          className="px-4 py-1.5 rounded-full bg-[#5eead4] text-[#003730] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#b5fff0] transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Download
                        </a>
                      )}
                      {job.status === "error" && (
                        <span className="text-xs font-mono text-red-400 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          ERROR
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="text-center py-12 text-[#52525B]">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-mono text-sm text-[#9A9AA5]">No conversions yet</p>
              <p className="text-xs text-[#52525B] max-w-xs mx-auto mt-1">
                Paste a YouTube URL to extract high-quality MP3 audio with customizable bitrate.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

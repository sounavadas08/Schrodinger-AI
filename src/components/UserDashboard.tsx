import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { gsap } from "gsap";
import { User, Camera, Clock, BarChart3, Save, X, TrendingUp } from "lucide-react";
import { UserProfile, UsageStats } from "../types";

const STORAGE_KEY = "schrodinger_user_data";

const loadUserData = (): { profile: UserProfile; stats: UsageStats } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    profile: {
      username: "Creator",
      avatar: "",
      createdAt: new Date().toISOString(),
    },
    stats: {
      totalUsageTime: 0,
      sectionsUsed: {},
      lastVisit: new Date().toISOString(),
      sessionCount: 0,
    },
  };
};

const saveUserData = (data: { profile: UserProfile; stats: UsageStats }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const UserDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(loadUserData);
  const [username, setUsername] = useState(data.profile.username);
  const [avatarPreview, setAvatarPreview] = useState(data.profile.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const updated = {
          ...prev,
          stats: {
            ...prev.stats,
            totalUsageTime: prev.stats.totalUsageTime + 1,
            lastVisit: new Date().toISOString(),
          },
        };
        saveUserData(updated);
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = {
        ...data,
        profile: {
          ...data.profile,
          username,
          avatar: avatarPreview,
        },
      };
      setData(updated);
      saveUserData(updated);
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getTopSection = () => {
    const entries = Object.entries(data.stats.sectionsUsed) as [string, number][];
    if (entries.length === 0) return "None yet";
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  const sectionLabels: Record<string, string> = {
    studio: "Live Studio",
    "video-generator": "Video Generator",
    "music-writer": "Music Writer",
    "weather-predictor": "Weather Predictor",
    "youtube-mp3": "YouTube Converter",
    compare: "Comparison",
    timeline: "Timeline",
    faq: "FAQ",
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          data-magnetic
          className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center hover:border-[#5eead4]/50 transition-all duration-300 group"
        >
          {data.profile.avatar ? (
            <img
              src={data.profile.avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
          ) : (
            <User className="w-5 h-5 text-[#5eead4] group-hover:scale-110 transition-transform" />
          )}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5eead4] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5eead4]" />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "power3.out" }}
              className="relative w-full max-w-lg bg-[#0E0E13]/90 backdrop-blur-2xl border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5eead4] via-[#c084fc] to-[#5eead4]" />

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-sora text-xl font-semibold text-white">Dashboard</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-[#9A9AA5]" />
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5eead4] text-[#003730] flex items-center justify-center hover:bg-[#b5fff0] transition-colors shadow-lg"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-mono text-[#9A9AA5] block mb-1.5">USERNAME</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-[#52525B] focus:outline-none focus:border-[#5eead4] text-base"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[#5eead4]" />
                        <span className="text-xs font-mono text-[#9A9AA5]">USAGE TIME</span>
                      </div>
                      <p className="text-2xl font-sora font-bold text-white">
                        {formatTime(data.stats.totalUsageTime)}
                      </p>
                      <p className="text-[10px] text-[#52525B] font-mono mt-1">
                        {data.stats.sessionCount} sessions
                      </p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#c084fc]" />
                        <span className="text-xs font-mono text-[#9A9AA5]">MOST USED</span>
                      </div>
                      <p className="text-lg font-sora font-bold text-white truncate">
                        {sectionLabels[getTopSection()] || getTopSection()}
                      </p>
                      <p className="text-[10px] text-[#52525B] font-mono mt-1">
                        {Object.keys(data.stats.sectionsUsed).length} tools explored
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-[#5eead4]" />
                      <span className="text-xs font-mono text-[#9A9AA5]">SECTION USAGE</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(data.stats.sectionsUsed)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 5)
                        .map(([section, count]) => {
                          const counts = Object.values(data.stats.sectionsUsed) as number[];
                          const maxCount = Math.max(...counts);
                          return (
                            <div key={section} className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">
                                {sectionLabels[section] || section}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#5eead4] rounded-full"
                                    style={{
                                      width: `${Math.min(100, ((count as number) / maxCount) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-[#9A9AA5] w-8 text-right">
                                  {count as number}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      {Object.keys(data.stats.sectionsUsed).length === 0 && (
                        <p className="text-xs text-[#52525B] text-center py-2">
                          Start using tools to see your stats
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-full bg-[#5eead4] text-[#003730] font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5fff0] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#5eead4]/20"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#003730]/30 border-t-[#003730] rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saved ? (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

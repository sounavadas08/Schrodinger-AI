import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UsageStats } from "../types";

const STORAGE_KEY = "schrodinger_user_data";

interface UserContextType {
  profile: UserProfile;
  stats: UsageStats;
  updateProfile: (updates: Partial<UserProfile>) => void;
  trackSection: (sectionId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<{ profile: UserProfile; stats: UsageStats }>(() => {
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
  });

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        profile: { ...prev.profile, ...updates },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const trackSection = (sectionId: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        stats: {
          ...prev.stats,
          sectionsUsed: {
            ...prev.stats.sectionsUsed,
            [sectionId]: (prev.stats.sectionsUsed[sectionId] || 0) + 1,
          },
          sessionCount: prev.stats.sessionCount + 1,
          lastVisit: new Date().toISOString(),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ profile: data.profile, stats: data.stats, updateProfile, trackSection }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, isConfigured } from "../firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);

    if (!isConfigured || !auth) {
      const msg =
        "Firebase Auth is not configured on Vercel.\n\nPlease configure VITE_FIREBASE_* environment variables in your Vercel Project Settings.";
      setAuthError(msg);
      alert(msg);
      return;
    }

    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("[Firebase Auth Error]:", err);

      if (err?.code === "auth/unauthorized-domain") {
        const domain = typeof window !== "undefined" ? window.location.hostname : "your Vercel domain";
        const msg = `[Firebase Auth Error]: Domain Unauthorized!\n\nThe domain "${domain}" is not authorized for Google Sign-In in Firebase.\n\nSolution:\n1. Open Firebase Console (https://console.firebase.google.com)\n2. Go to Authentication -> Settings -> Authorized domains\n3. Click "Add domain" and enter "${domain}" (and any vercel.app domains).`;
        setAuthError(msg);
        alert(msg);
      } else if (
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/popup-closed-by-user"
      ) {
        console.warn("Popup closed or blocked. Attempting redirect fallback...");
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          const msg = redirectErr?.message || "Failed to complete sign-in redirect.";
          setAuthError(msg);
        }
      } else {
        const msg = err?.message || "An unexpected error occurred during Google sign in.";
        setAuthError(msg);
        alert(`Authentication Error: ${msg}`);
      }
    }
  };

  const signOutUser = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Sign out error", err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: isConfigured,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

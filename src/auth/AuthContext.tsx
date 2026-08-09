import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";
import { auth as firebaseAuth, isConfigured as isFirebaseConfigured } from "../firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { AuthModal } from "../components/AuthModal";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface LocalAccount {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

const ACCOUNTS_KEY = "schrodinger_accounts_store";

const getLocalAccounts = (): LocalAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAccounts = (accs: LocalAccount[]) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
};

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  configured: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem("schrodinger_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const saveUserLocal = (u: AppUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("schrodinger_auth_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("schrodinger_auth_user");
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          saveUserLocal({
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "User",
            photoURL: session.user.user_metadata?.avatar_url || null,
          });
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          saveUserLocal({
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "User",
            photoURL: session.user.user_metadata?.avatar_url || null,
          });
        } else {
          saveUserLocal(null);
        }
      });

      return () => listener?.subscription?.unsubscribe();
    }

    if (firebaseAuth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
        if (currentUser) {
          saveUserLocal({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
            photoURL: currentUser.photoURL,
          });
        } else {
          saveUserLocal(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }

    setLoading(false);
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      throw new Error("Please enter both email and password.");
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. If you don't have an account, please sign up first.");
        }
        throw error;
      }
      if (data?.user) {
        saveUserLocal({
          uid: data.user.id,
          email: data.user.email || null,
          displayName: data.user.user_metadata?.display_name || data.user.email?.split("@")[0] || "User",
        });
      }
      return;
    }

    if (firebaseAuth && isFirebaseConfigured) {
      try {
        const res = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
        saveUserLocal({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split("@")[0] || "User",
        });
        return;
      } catch (err: any) {
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          throw new Error("No account found matching this email and password. Please sign up first or check your details.");
        } else if (err.code === "auth/wrong-password") {
          throw new Error("Incorrect password. Please try again.");
        }
        throw err;
      }
    }

    // Strict local verification fallback
    const accounts = getLocalAccounts();
    const existing = accounts.find((a) => a.email === cleanEmail);

    if (!existing) {
      throw new Error(
        `No account found for "${cleanEmail}". Please click "Sign Up" below to create an account first.`
      );
    }

    if (existing.passwordHash !== btoa(pass)) {
      throw new Error("Incorrect password. Please verify your password and try again.");
    }

    saveUserLocal({
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
    });
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      throw new Error("Please enter a valid email and password.");
    }
    if (pass.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: { data: { display_name: name } },
      });
      if (error) throw error;
      if (data?.user) {
        saveUserLocal({
          uid: data.user.id,
          email: data.user.email || null,
          displayName: name || cleanEmail.split("@")[0],
        });
      }
      return;
    }

    if (firebaseAuth && isFirebaseConfigured) {
      try {
        const res = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, pass);
        if (name && res.user) {
          await updateProfile(res.user, { displayName: name });
        }
        saveUserLocal({
          uid: res.user.uid,
          email: res.user.email,
          displayName: name || res.user.email?.split("@")[0] || "User",
        });
        return;
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          throw new Error("An account with this email already exists. Please switch to Sign In.");
        }
        throw err;
      }
    }

    // Strict local registration fallback
    const accounts = getLocalAccounts();
    const existing = accounts.find((a) => a.email === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please click 'Sign In' to log into your existing account.");
    }

    const newAccount: LocalAccount = {
      uid: "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      email: cleanEmail,
      passwordHash: btoa(pass),
      displayName: name?.trim() || cleanEmail.split("@")[0],
      createdAt: new Date().toISOString(),
    };

    saveLocalAccounts([...accounts, newAccount]);

    saveUserLocal({
      uid: newAccount.uid,
      email: newAccount.email,
      displayName: newAccount.displayName,
    });
  };

  const signInWithGoogle = async () => {
    setAuthError(null);

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      return;
    }

    if (firebaseAuth && isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(firebaseAuth, provider);
      } catch (err: any) {
        console.error("[Firebase Auth Error]:", err);
        if (err?.code === "auth/unauthorized-domain") {
          const domain = window.location.hostname;
          const msg = `Domain "${domain}" is not authorized in Firebase. Please sign in with Email or authorize "${domain}" in Firebase Console.`;
          setAuthError(msg);
          alert(msg);
        } else if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(firebaseAuth, provider);
        } else {
          throw err;
        }
      }
      return;
    }

    openAuthModal();
  };

  const signOutUser = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    if (firebaseAuth && isFirebaseConfigured) {
      await firebaseSignOut(firebaseAuth);
    }
    saveUserLocal(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configured: true,
        authError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
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

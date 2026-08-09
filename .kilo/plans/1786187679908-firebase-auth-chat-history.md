# Plan: Firebase Auth + Per-User Chat History (Schrödinger AI Studio)

## Context
The app already has a working backend: `server.ts` (local Express dev server) and
`api/index.ts` (Vercel serverless function, default export), both exposing
`/api/generate-script`, `/api/generate-image`, `/api/aura-chat`. `vercel.json`
rewrites `/api/*` to the function. Today the chat (`src/components/AuraChat.tsx`)
is **stateless** — messages live only in React state and are lost on refresh, and
the endpoints are **open** (no login). No Firebase is installed.

Goal (from user): integrate Firebase for **Google sign-in** + **per-user chat
history** that survives refresh/sessions. Login is **optional** — chat works
anonymously (in-memory); when signed in, history is loaded from and saved to
Firestore and restored across sessions.

## Decisions (confirmed with user)
- **Hosting:** Keep Vercel/local Express. Firebase used for **Auth + Firestore only** (no Hosting/Functions migration).
- **Auth method:** **Google sign-in only** (no email/password, no anonymous Firebase).
- **History model:** **Single ongoing thread per user** at `users/{uid}/messages`.
- **Login gating:** **Optional** — anonymous chat allowed; history persisted only when signed in.

## Architecture
- Frontend uses the **Firebase JS SDK** (modular v10+): `auth` + `firestore`.
- **No Firebase Admin SDK** on the server. The AI endpoints stay open for anonymous
  use; persistence is handled client-side against Firestore, protected by security
  rules (`request.auth.uid == uid`). This keeps the server lean and avoids managing
  a service-account secret.
- On Google sign-in, client loads the user's thread from Firestore into `AuraChat`
  state. Every user + assistant message is written to `users/{uid}/messages`.
- Signed-out users chat in-memory only (current behavior), with a hint to sign in
  to save history.

## Prerequisites (user action in Firebase console)
1. Create a Firebase project.
2. **Authentication → Sign-in method → enable Google.**
3. **Firestore Database → create** (start in production mode, then apply rules below).
4. Project settings → add a **Web app**; copy the config values.

## Implementation steps (ordered)
1. **Install deps:** `npm i firebase` (client SDK).
2. **Env / config:**
   - Add to `.env` (and document in `.env.example`) the public client config:
     `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
     `VITE_FIREBASE_APP_ID`. These are **public** (safe to expose via `VITE_` prefix).
   - Keep `GEMINI_API_KEY` server-side only (already gitignored; set in Vercel env for deploy).
   - Verify `.gitignore` excludes `.env` (it already does via `.env*`).
3. **`src/firebase.ts` (new):** initialize `initializeApp` from
   `import.meta.env.VITE_FIREBASE_*`; export `auth` and `db` (Firestore).
4. **`src/auth/AuthContext.tsx` (new):** `AuthProvider` using `onAuthStateChanged`;
   expose `{ user, loading, signInWithGoogle, signOutUser }`.
   - `signInWithGoogle` → `signInWithPopup(auth, new GoogleAuthProvider())`.
5. **`src/main.tsx` (modify):** wrap `<App/>` with `<AuthProvider>`.
6. **`src/components/Navbar.tsx` (modify):** when logged out show a **"Sign in with
   Google"** button; when logged in show avatar/email + **Logout**. Use `useAuth()`.
7. **`src/types.ts` (modify):** extend `ChatMessage` with `createdAt?: any`
   (Firestore `Timestamp`) alongside existing `timestamp: string`.
8. **`src/components/AuraChat.tsx` (modify):**
   - Use `useAuth()`. On mount, if `user`, load thread:
     `getDocs(query(collection(db,'users',uid,'messages'), orderBy('createdAt','asc'), limit(50)))`
     and seed `messages` state (fallback to current welcome message if empty).
   - On send: keep current optimistic flow; after a successful assistant reply, if
     `user`, `addDoc(collection(db,'users',uid,'messages'), { role, content, createdAt: serverTimestamp() })`
     for BOTH the user message and the assistant reply.
   - If not signed in: show a small "Sign in to save your chat history" hint; do not write to Firestore.
   - (Optional enhancement) When a signed-out user signs in mid-conversation, flush
     current in-memory messages to Firestore.
9. **`firestore.rules` (new):**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /users/{uid}/messages/{doc} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
   Deploy via Firebase CLI (`firebase deploy --only firestore:rules`) or console paste.
10. **Keep both server entry points:** `server.ts` and `api/index.ts` need **no auth
    changes** for this feature. NOTE (cleanup, optional): their Gemini model names
    currently diverge (`server.ts` → `gemini-3.6-flash`, `api/index.ts` →
    `gemini-2.5-flash`); align them to avoid behavior differences between local and Vercel.

## Affected files
- New: `src/firebase.ts`, `src/auth/AuthContext.tsx`, `firestore.rules`
- Modify: `package.json` (dep), `src/main.tsx`, `src/components/Navbar.tsx`,
  `src/components/AuraChat.tsx`, `src/types.ts`, `.env` + `.env.example`
- Untouched (by design): `server.ts`, `api/index.ts`

## Validation
- **Local:** `npm run dev`; open `http://localhost:3001`.
  - Sign in with Google (localhost is an authorized domain by default in Firebase).
  - Send several messages; refresh the page → thread restored from Firestore.
  - Sign out → chat is in-memory only; history hint shown.
  - Re-sign in → previous thread loads.
- **Security:** in Firestore rules simulator, attempt read/write on
  `users/otherUid/messages` → denied; `users/selfUid/messages` → allowed.
- **Deploy:** set the `VITE_FIREBASE_*` and `GEMINI_API_KEY` env vars in Vercel;
  deploy; repeat the sign-in / refresh test on the live URL.

## Risks / open questions
- **Open AI endpoint abuse:** since login is optional, `/api/aura-chat` is publicly
  callable (cost/rate-limit risk). Out of scope, but a later step could add token
  verification (Firebase Admin SDK) or rate limiting. Flagged, not implemented.
- **Server model divergence** (`3.6-flash` vs `2.5-flash`) noted as optional cleanup.
- **Multiple devices:** single thread per user is shared across devices (by design);
  concurrent edits could interleave — acceptable for v1.
- **Firestore pricing/quotas:** Spark (free) plan is sufficient for dev; note limits.

# Design Specification: Configurable AI Models & API Keys

## Goal
Centralize all AI model identifiers across backend endpoints (`api/index.ts`, `api/handlers/nanobanana.ts`, `api/handlers/veo.ts`) and make them dynamically configurable via `.env` environment variables, while maintaining clean default values.

## Proposed Changes

### 1. `api/index.ts`
- Update central `MODELS` constant to load from `process.env` with default fallbacks:
  ```ts
  export const MODELS = {
    text: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
    image: {
      nanoBanana: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
      pollinationsFallback: process.env.POLLINATIONS_IMAGE_MODEL || "flux",
    },
    video: process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview",
    music: process.env.GEMINI_MUSIC_MODEL || "lyria-3-pro-preview",
  } as const;
  ```

### 2. `api/handlers/nanobanana.ts`
- Replace hardcoded `const MODEL = "models/gemini-3.1-flash-lite-image"` with `process.env.GEMINI_IMAGE_MODEL || "models/gemini-3.1-flash-lite-image"`.

### 3. `api/handlers/veo.ts`
- Replace hardcoded `const MODEL = "gemini-omni-flash-preview"` with `process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview"`.

### 4. `.env` and `.env.example`
- Add dedicated environment variables:
  ```env
  # Model Identifiers (Override default models here)
  GEMINI_TEXT_MODEL="gemini-2.5-flash"
  GEMINI_IMAGE_MODEL="imagen-3.0-generate-002"
  GEMINI_VIDEO_MODEL="veo-2.0-generate-001"
  GEMINI_MUSIC_MODEL="lyria-3-pro-preview"
  ```

## Verification Plan
1. Check that server compiles without TypeScript errors (`npm run build` / `npx tsc --noEmit`).
2. Test script, image, video, and music generation endpoints with the configured models.

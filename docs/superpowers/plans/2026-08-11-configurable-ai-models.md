# Configurable AI Models & API Keys Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize AI model selection in environment variables and update handler files so that models and API keys can be changed easily without editing source code.

**Architecture:** Update `api/index.ts`, `api/handlers/nanobanana.ts`, `api/handlers/veo.ts`, `.env`, and `.env.example` to read model names from environment variables (`GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`, `GEMINI_VIDEO_MODEL`, `GEMINI_MUSIC_MODEL`) with fallback defaults.

**Tech Stack:** Node.js, Express, TypeScript, `@google/genai`

## Global Constraints

- Preserve all existing functionality and fallbacks.
- Do not break existing API key fallbacks (`process.env.GEMINI_API_KEY`, `process.env.VITE_NANOBANANA_API_KEY`, etc.).

---

### Task 1: Environment Variables Setup

**Files:**
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\.env:1-28`
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\.env.example:1-25`

**Interfaces:**
- Produces: `GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL`, `GEMINI_VIDEO_MODEL`, `GEMINI_MUSIC_MODEL`

- [ ] **Step 1: Add model configuration to `.env`**

Add model environment variables to `.env`.

- [ ] **Step 2: Add model configuration to `.env.example`**

Add model environment variables to `.env.example`.

---

### Task 2: Refactor `api/index.ts` to Use Environment Variables for Models

**Files:**
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\api\index.ts:13-27`

**Interfaces:**
- Consumes: `process.env.GEMINI_TEXT_MODEL`, `process.env.GEMINI_IMAGE_MODEL`, `process.env.GEMINI_VIDEO_MODEL`, `process.env.GEMINI_MUSIC_MODEL`
- Produces: `MODELS` constant object exported/used across `api/index.ts`

- [ ] **Step 1: Update `MODELS` definition in `api/index.ts`**

Update `MODELS` in `api/index.ts` to resolve dynamically from environment variables.

---

### Task 3: Refactor `api/handlers/nanobanana.ts` and `api/handlers/veo.ts`

**Files:**
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\api\handlers\nanobanana.ts:6`
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\api\handlers\veo.ts:10`

**Interfaces:**
- Consumes: `process.env.GEMINI_IMAGE_MODEL`, `process.env.GEMINI_VIDEO_MODEL`

- [ ] **Step 1: Update `MODEL` in `nanobanana.ts`**

Use `process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image"` in `nanobanana.ts`.

- [ ] **Step 2: Update `MODEL` in `veo.ts`**

Use `process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview"` in `veo.ts`.

---

### Task 4: Verification & Build Check

- [ ] **Step 1: Run TypeScript compiler check**

Run `npx tsc --noEmit` to ensure no build errors exist.

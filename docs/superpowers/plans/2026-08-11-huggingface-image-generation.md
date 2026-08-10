# Hugging Face Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Hugging Face Inference API for image generation using the provided API key (`HF_API_KEY`) and high-quality FLUX model.

**Architecture:** Create `api/handlers/huggingface.ts` to call Hugging Face Inference API, update `.env`, and integrate into `api/index.ts` `/api/generate-image` endpoint.

**Tech Stack:** Node.js, Express, Fetch API, Hugging Face Inference API

## Global Constraints

- Do not break existing Gemini / Pollinations fallbacks.
- Securely load `HF_API_KEY` from environment variables.

---

### Task 1: Store Hugging Face API Key & Model in Environment

**Files:**
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\.env`
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\.env.example`

- [ ] **Step 1: Add `HF_API_KEY` and `HF_IMAGE_MODEL` to `.env`**

Add the provided `HF_API_KEY` and default model `black-forest-labs/FLUX.1-schnell` to `.env`.

- [ ] **Step 2: Update `.env.example`**

Add `HF_API_KEY=` and `HF_IMAGE_MODEL="black-forest-labs/FLUX.1-schnell"` to `.env.example`.

---

### Task 2: Create Hugging Face Handler (`api/handlers/huggingface.ts`)

**Files:**
- Create: `g:\Practice web\test-react\schrodinger-ai-studio\api\handlers\huggingface.ts`

**Interfaces:**
- Produces: `generateHuggingFaceImage(prompt: string): Promise<{ dataUrl: string; mimeType: string }>`

- [ ] **Step 1: Write `api/handlers/huggingface.ts`**

Implement `generateHuggingFaceImage` with `fetch`, authorization header, and arrayBuffer to base64 conversion.

---

### Task 3: Integrate Hugging Face in Image Endpoint (`api/index.ts`)

**Files:**
- Modify: `g:\Practice web\test-react\schrodinger-ai-studio\api\index.ts`

- [ ] **Step 1: Import `generateHuggingFaceImage` in `api/index.ts`**

Import handler at top of `api/index.ts`.

- [ ] **Step 2: Update `/api/generate-image` endpoint**

Try Hugging Face image generation first when `HF_API_KEY` is present, falling back to Nano Banana and Pollinations.

---

### Task 4: Verification

- [ ] **Step 1: Run TypeScript compiler check**

Run `npx tsc --noEmit` to verify type safety.

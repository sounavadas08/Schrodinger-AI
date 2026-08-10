# Design Specification: Hugging Face Image Generation Integration

## Goal
Integrate Hugging Face Inference API for image generation using the provided Hugging Face API key (`HF_API_KEY`), using state-of-the-art models like `FLUX.1-schnell` / `FLUX.1-dev` as the primary or secondary image generation provider.

## Proposed Architecture

1. **Environment Configuration (`.env` and `.env.example`)**:
   - Add `HF_API_KEY="your_huggingface_api_key_here"`
   - Add `HF_IMAGE_MODEL="black-forest-labs/FLUX.1-schnell"`

2. **Hugging Face Handler (`api/handlers/huggingface.ts`)**:
   - Create a dedicated module using native `fetch` to call `https://api-inference.huggingface.co/models/${model}`.
   - Send prompt with Authorization header `Bearer ${HF_API_KEY}`.
   - Convert returned binary buffer into base64 data URI (`data:image/png;base64,...`).

3. **Image Generator Endpoint (`api/index.ts`)**:
   - Integrate Hugging Face into `app.post("/api/generate-image")`.
   - Priority sequence: Hugging Face FLUX.1 -> Gemini Nano Banana -> Pollinations fallback.

## Verification Plan
1. Check TypeScript compilation (`npx tsc --noEmit`).
2. Test `/api/generate-image` endpoint with a prompt to confirm Hugging Face returns a valid base64 image data URL.

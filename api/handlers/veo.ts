import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";

// NOTE: The user's dedicated Veo handler file was not provided (both pasted
// files were the Nano Banana image handler). This implements video generation
// through the Gemini Interactions API as a placeholder. Swap MODEL (and the
// result parsing below) for the user's actual Veo file when given.
// Per the Interactions API docs, video generation uses `gemini-omni-flash-preview`.
const MODEL = process.env.GEMINI_VIDEO_MODEL || process.env.VITE_VEO_MODEL || "veo-3.1-generate-preview";

export function getVideoClient(): GoogleGenAI {
  const key = process.env.VITE_VEO_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    throw new Error("Video model unavailable: set GEMINI_API_KEY or VITE_VEO_API_KEY");
  }
  return new GoogleGenAI({ apiKey: key });
}

export async function generateVeoVideo(
  prompt: string,
  opts: { durationSeconds?: number; aspectRatio?: string; style?: string }
): Promise<{ videoUrl: string }> {
  const ai = getVideoClient();

  const interaction = await ai.interactions.create({
    model: MODEL,
    input: `${opts.style ? opts.style + " style, " : ""}cinematic, ${prompt}`,
    generation_config: {
      durationSeconds: opts.durationSeconds ?? 10,
      aspectRatio: opts.aspectRatio ?? "16:9",
    } as any,
    response_modalities: ["video", "text"],
  });

  if (interaction.steps) {
    for (const step of interaction.steps as any[]) {
      if (step.type === "model_output" && step.content) {
        for (const part of step.content as any[]) {
          if (part.type === "video") {
            if (part.uri) return { videoUrl: part.uri };
            if (part.data) {
              const downloadDir = path.resolve(process.env.VITE_MP3_DOWNLOAD_DIR || "public/downloads");
              if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
              const ext = (part.mime_type || "video/mp4").split("/")[1] || "mp4";
              const fileName = `veo_${Date.now()}.${ext}`;
              fs.writeFileSync(path.join(downloadDir, fileName), Buffer.from(part.data, "base64"));
              return { videoUrl: `/downloads/${fileName}` };
            }
          }
        }
      }
    }
  }

  throw new Error("Video model returned no video.");
}

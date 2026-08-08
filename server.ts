import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes

// 1. Script Generation Endpoint
app.post("/api/generate-script", async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Write a high-concept cinematic screenplay excerpt based on this prompt: "${prompt}". 
Format with clear Scene Headings (EXT/INT), Scene Description, Camera Angles, Character Names (UPPERCASE), Dialogue, and Sound Design Notes. Keep it visually evocative and professional.`,
        config: {
          systemInstruction:
            "You are an award-winning Hollywood screenwriter and showrunner. Deliver beautifully formatted, crisp, high-impact screenplays.",
          temperature: 0.8,
        },
      });

      if (response && response.text) {
        return res.json({ script: response.text });
      }
    }

    // Fallback if API key not available or request fails
    const fallbackScript = `TITLE: ${prompt.toUpperCase().slice(0, 30)}...
GENRE: ${style || "Cinematic Thriller / Drama"}
WRITTEN BY: SCHRÖDINGER AI STUDIO

[SCENE 1]
INT. OBSURGENT RESEARCH LAB - NIGHT

A lone amber pulse flickers against the brushed titanium floor. Heavy acoustic dampening muffles the thunderstorm howling outside the floor-to-ceiling reinforced glass.

DR. ARLO VANCE (40s, rain-soaked trench coat, exhausted eyes) stands before a glass quantum chamber. Floating in mid-air is a fractured light sphere—THE SCHRÖDINGER CORE.

DR. VANCE
(whispering into earpiece)
Timeline index 0-9-alpha is unstable. If we initiate sequence now, the narrative converges.

VOICE (O.S. / DISTORTED)
Proceed, Vance. The studio audience is waiting.

[CAMERA ANGLE: SLOW SLIDER ZOOM INTO VANCE'S EYES]

Vance hesitates, hand hovering over a glowing touch surface. Reflection of glowing code cascades across his pupils.

DR. VANCE
It's not just a script. It's living memory.

[AUDIO NOTE: LOW SUB-BASS RUMBLE SWEEPS INTO SYNTH ARPEGGIATED SWELL]

CUT TO BLACK.

[SCENE 2]
EXT. NEON METROPOLIS OVERPASS - CONTINUOUS

An impossibly sleek vertical air-car cuts through dense violet haze, trailing blue ion exhaust. Below, a endless grid of glowing billboards displays real-time generative stories.`;

    return res.json({ script: fallbackScript });
  } catch (error: any) {
    console.error("Error generating script:", error);
    res.status(500).json({ error: error.message || "Failed to generate script" });
  }
});

// Build a prompt-driven AI image URL via Pollinations (keyless, varied per prompt).
function pollinationsUrl(prompt: string, aspectRatio: string): string {
  const dims: Record<string, [number, number]> = {
    "16:9": [1280, 720],
    "9:16": [720, 1280],
    "1:1": [1024, 1024],
    "4:3": [1024, 768],
  };
  const [w, h] = dims[aspectRatio] || dims["16:9"];
  const text = encodeURIComponent(
    `cinematic concept art, highly detailed movie scene still, masterpiece lighting, ${prompt}`
  );
  const seed = Math.floor(Math.random() * 1_000_000);
  return `https://image.pollinations.ai/prompt/${text}?width=${w}&height=${h}&nologo=true&model=flux&seed=${seed}`;
}

// 2. Concept Art / Image Generator Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        // Gemini image generation requires an image-capable model + responseModalities.
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [
              {
                text: `Cinematic concept art, high detailed movie scene frame, 8k render, masterpiece lighting: ${prompt}`,
              },
            ],
          },
          config: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              return res.json({ imageUrl: `data:${mimeType};base64,${base64Data}` });
            }
          }
        }
      } catch (imgError: any) {
        console.warn(
          "Gemini image generation unavailable on this key, using AI fallback:",
          imgError?.message?.slice(0, 120)
        );
      }
    }

    // Reliable prompt-driven AI image fallback (works without a Gemini image key).
    const imageUrl = pollinationsUrl(prompt, aspectRatio);
    return res.json({ imageUrl, fallback: true });
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: error.message || "Failed to generate concept art" });
  }
});

// 3. Aura Chat Endpoint
app.post("/api/aura-chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const ai = getGenAI();
    if (ai) {
      const formattedHistory = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Take last user prompt
      const lastUserMsg = messages[messages.length - 1]?.content || "Hello";

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedHistory,
        config: {
          systemInstruction:
            "You are Aura, the intelligent AI creative partner inside Schrödinger AI Studio. You are an expert in filmmaking, cinematic storytelling, screenwriting, color grading, shot composition, and AI-driven post-production. Keep answers sharp, concise, inspiring, and conversational.",
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    }

    // Smart context-aware fallback response
    const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";
    let reply = "I'm Aura, your Schrödinger AI creative partner! How can I help refine your plot, shot list, or character arc today?";

    if (lastUserMsg.includes("script") || lastUserMsg.includes("screenplay")) {
      reply = "For screenwriting, I recommend structuring your three-act arc around a stark central dilemma. Try opening with a non-verbal visual sequence that establishes the atmospheric tone before dialogue begins.";
    } else if (lastUserMsg.includes("lighting") || lastUserMsg.includes("camera") || lastUserMsg.includes("shot")) {
      reply = "Try a 35mm anamorphic setup with anamorphic oval bokeh and soft teal/orange volumetric rim lighting. This instantly gives your scene a high-budget feature film texture.";
    } else if (lastUserMsg.includes("workflow") || lastUserMsg.includes("turnaround")) {
      reply = "Schrödinger AI Studio condenses traditional 6-month pre-production workflows into minutes. You can auto-generate scripts, map storyboards, render concept art, and export EDL timelines seamlessly.";
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in Aura Chat:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// Vite / Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: { port: parseInt(process.env.VITE_HMR_PORT || "24679", 10) },
        },
        appType: "spa",
      });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Schrödinger AI Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

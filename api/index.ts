import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
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

// 1. Script Generation Endpoint
app.post("/api/generate-script", async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
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
      } catch (geminiErr: any) {
        console.warn("Gemini API issue (using fallback):", geminiErr?.message || geminiErr);
      }
    }

    const title = prompt.toUpperCase().slice(0, 35);
    const fallbackScript = `TITLE: ${title}...
GENRE: ${style || "Cinematic / Drama / Comedy"}
WRITTEN BY: SCHRÖDINGER AI STUDIO

[SCENE 1]
INT. MAIN SETTING - DAY

The ambient light settles softly across the room. Atmospheric tension builds as the camera slowly slides forward.

CHARACTER A (30s, sharp, energetic) looks across at CHARACTER B.

CHARACTER A
(grinning)
You really think this idea is going to work?

CHARACTER B
(nodding with quiet confidence)
It's not just going to work. It's going to redefine the whole game.

[CAMERA ANGLE: SLOW TRACKING CLOSE-UP ON CHARACTER B]

A sudden rhythmic beat kicks in as key lighting shifts dynamic hues.

[AUDIO NOTE: DYNAMIC SYNTH SWELL WITH CRISP Foley IMPACTS]

CUT TO BLACK.

[SCENE 2]
EXT. DYNAMIC CITYSCAPE - MOMENTS LATER

A sweeping drone shot captures the vivid horizon as dramatic clouds move across the sky.`;

    return res.json({ script: fallbackScript });
  } catch (error: any) {
    console.error("Error generating script:", error);
    res.status(500).json({ error: error.message || "Failed to generate script" });
  }
});

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
        console.warn("Gemini image generation warning, using AI fallback:", imgError?.message?.slice(0, 120));
      }
    }

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
      try {
        const formattedHistory = messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
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
      } catch (chatErr: any) {
        console.warn("Aura Chat Gemini API warning (using fallback):", chatErr?.message || chatErr);
      }
    }

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

export default app;

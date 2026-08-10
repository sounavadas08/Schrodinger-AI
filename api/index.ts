import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { YtDlp } from "ytdlp-nodejs";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { generateVeoVideo } from "./handlers/veo";
import { generateHuggingFaceImage } from "./handlers/huggingface";

dotenv.config();

// Centralized AI model identifiers used across the generation endpoints.
// Keep every model name configurable via environment variables.
export const MODELS = {
  // Shared text model (used for script, music descriptions, and Aura chat).
  text: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
  // Image generation: Nano Banana (primary) with Pollinations Flux fallback.
  image: {
    nanoBanana: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
    pollinationsFallback: process.env.POLLINATIONS_IMAGE_MODEL || "flux",
  },
  // Video generation (Veo 3.1).
  video: process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview",
  // Music / song generation (Lyria 3 Pro).
  music: process.env.GEMINI_MUSIC_MODEL || "lyria-3-pro-preview",
};

// Graceful fallbacks (Pollinations image frames, text fallbacks) are OFF by
// default. The site uses the direct Gemini models (Nano Banana, Veo 3.1, Lyria
// 3 Pro) and surfaces errors instead of silently swapping providers. Set
// ALLOW_FALLBACK=true to permit the fallbacks when a direct model is unavailable.
const ALLOW_FALLBACK = process.env.ALLOW_FALLBACK === "true";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Serve static MP3 downloads
app.use('/downloads', express.static(path.resolve(process.env.VITE_MP3_DOWNLOAD_DIR || 'public/downloads')));

// Initialize GoogleGenAI lazily with optional custom API key
function getGenAI(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
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
  return `https://image.pollinations.ai/prompt/${text}?width=${w}&height=${h}&nologo=true&model=${MODELS.image.pollinationsFallback}&seed=${seed}`;
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
          model: MODELS.text,
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

// 2. Concept Art / Image Generator Endpoint (Hugging Face FLUX only)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Image generation uses Hugging Face (FLUX) exclusively — no Gemini / Pollinations.
    if (!process.env.HF_API_KEY || process.env.HF_API_KEY === "MY_HF_API_KEY") {
      return res.status(502).json({
        error: "Image generation is configured for Hugging Face only. Set HF_API_KEY in the environment.",
      });
    }

    try {
      const { dataUrl } = await generateHuggingFaceImage(prompt);
      return res.json({ imageUrl: dataUrl, model: process.env.HF_IMAGE_MODEL || "huggingface-flux" });
    } catch (hfError: any) {
      console.warn("Hugging Face image generation failed:", hfError?.message?.slice(0, 200));
      return res.status(502).json({
        error: hfError?.message || "Hugging Face image generation failed.",
      });
    }
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
          model: MODELS.text,
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

// 4. Video Generation Endpoint (Veo 3.1)
app.post("/api/generate-video", async (req, res) => {
  try {
    const { prompt, duration, aspectRatio = "16:9", style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Try Veo (direct model) via the dedicated handler.
    // Fall back to a Pollinations preview frame only when ALLOW_FALLBACK is enabled.
    try {
      const { videoUrl } = await generateVeoVideo(prompt, {
        durationSeconds: parseInt((duration || "10s").replace(/[^0-9]/g, "")) || 10,
        aspectRatio,
        style,
      });
      const title = prompt.slice(0, 50).trim();
      return res.json({ videoUrl, title, model: "veo" });
    } catch (veoErr: any) {
      console.warn("Veo video generation failed:", veoErr?.message?.slice(0, 200) || veoErr);
      if (ALLOW_FALLBACK) {
        const title = prompt.slice(0, 50).trim() || "AI Generated Video";
        const videoUrl = pollinationsUrl(`${style} video scene, motion, ${prompt}`, aspectRatio);
        return res.json({ videoUrl, title, fallback: true });
      }
      return res.status(502).json({
        error: veoErr?.message || "Video generation failed.",
        hint: "Set ALLOW_FALLBACK=true to use a Pollinations preview frame.",
      });
    }
  } catch (error: any) {
    console.error("Error generating video:", error);
    res.status(500).json({ error: error.message || "Failed to generate video" });
  }
});

// 5. Music Generation Endpoint (Lyria 3 Pro)
app.post("/api/generate-music", async (req, res) => {
  try {
    const { genre, mood, duration, instruments, prompt } = req.body;
    if (!genre || !mood) {
      return res.status(400).json({ error: "Genre and mood are required" });
    }

    const lyriaKey = process.env.VITE_LYRIA_API_KEY;
    const ai = getGenAI(lyriaKey) || getGenAI();
    let description = "";
    let bpm = 120;
    let key = "C Major";
    let timeSignature = "4/4";
    let title = "";
    let audioUrl: string | undefined;

    const musicPrompt = `${mood} ${genre} music, ${instruments?.join(", ") || "orchestral"} instruments, ${duration || "2:00"} duration${prompt ? `, ${prompt}` : ""}`;

    if (!ai && !ALLOW_FALLBACK) {
      return res.status(502).json({
        error: "Music model unavailable: set GEMINI_API_KEY / VITE_LYRIA_API_KEY, or set ALLOW_FALLBACK=true to use a text description.",
      });
    }

    // Try Lyria 3 Pro (direct model) for actual audio + description.
    if (ai) {
      try {
        const lyriaRes = await (ai as any).models.generateContent({
          model: MODELS.music,
          contents: musicPrompt,
        });

        if (lyriaRes?.candidates?.[0]?.content?.parts) {
          for (const part of lyriaRes.candidates[0].content.parts) {
            if (part.inlineData?.mimeType?.startsWith("audio/")) {
              // Save audio to downloads directory
              const downloadDir = path.resolve(process.env.VITE_MP3_DOWNLOAD_DIR || "public/downloads");
              if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });
              const safeName = `${mood}_${genre}_${Date.now()}`.replace(/[^a-z0-9_]/gi, "_");
              const ext = part.inlineData.mimeType.split("/")[1] || "mp3";
              const fileName = `${safeName}.${ext}`;
              const filePath = path.join(downloadDir, fileName);
              fs.writeFileSync(filePath, Buffer.from(part.inlineData.data, "base64"));
              audioUrl = `/downloads/${fileName}`;
            }
            if (part.text) description = part.text;
          }
        }
      } catch (lyriaErr: any) {
        console.warn("Lyria 3 Pro failed:", lyriaErr?.message?.slice(0, 200));
        if (!ALLOW_FALLBACK) {
          return res.status(502).json({
            error: lyriaErr?.message || "Lyria music generation failed.",
            hint: "Set ALLOW_FALLBACK=true to use a text description fallback.",
          });
        }
      }

      // If Lyria didn't return a description, get one from the Gemini text model
      // (still a direct model; treated as a fallback, so only when enabled).
      if (!description && !audioUrl && ALLOW_FALLBACK) {
        try {
          const geminiAi = getGenAI();
          if (geminiAi) {
            const response = await geminiAi.models.generateContent({
              model: MODELS.text,
              contents: `Compose a detailed musical piece with the following parameters:
Genre: ${genre}
Mood: ${mood}
Duration: ${duration}
Instruments: ${instruments?.join(", ") || "piano, strings"}
Additional notes: ${prompt || "None"}

Provide: a catchy title, BPM, musical key, time signature, and a 2-3 sentence description of the composition including motifs, dynamic changes, and instrumentation details.`,
              config: {
                systemInstruction:
                  "You are an award-winning film composer and music producer. Provide professional music composition details.",
                temperature: 0.9,
              },
            });
            if (response?.text) description = response.text;
          }
        } catch (geminiErr: any) {
          console.warn("Gemini music description warning:", geminiErr?.message || geminiErr);
        }
      }
    }

    if (!description && !audioUrl) {
      if (!ALLOW_FALLBACK) {
        return res.status(502).json({
          error: "Music model returned no result and fallback is disabled. Set ALLOW_FALLBACK=true to use a text description.",
        });
      }
      const moodBpmMap: Record<string, number> = {
        Epic: 140, Melancholic: 72, Energetic: 160, Calm: 90,
        Dark: 100, Uplifting: 130, Tense: 150, Romantic: 85,
      };
      bpm = moodBpmMap[mood] || 120;
      title = `${mood} ${genre} Composition`;
      description = `A ${mood.toLowerCase()} ${genre.toLowerCase()} piece featuring ${instruments?.join(" and ") || "orchestral instruments"}. The track builds with layered ${instruments?.[0] || "strings"} motifs over a ${bpm} BPM foundation, creating an immersive ${mood.toLowerCase()} atmosphere throughout the ${duration} runtime.`;
    }

    return res.json({
      track: {
        title,
        genre,
        mood,
        bpm,
        key,
        timeSignature,
        duration,
        instruments: instruments || ["Piano", "Strings"],
        description,
        ...(audioUrl ? { audioUrl } : {}),
      },
    });
  } catch (error: any) {
    console.error("Error generating music:", error);
    res.status(500).json({ error: error.message || "Failed to generate music" });
  }
});

// 6. Weather Proxy Endpoint
app.get("/api/get-weather", async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location as string)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`);
    const weatherData = await weatherRes.json();

    res.json({
      location: `${name}, ${country}`,
      current: weatherData.current,
      daily: weatherData.daily,
    });
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    res.status(500).json({ error: error.message || "Failed to fetch weather" });
  }
});

// 7. YouTube to MP3 Conversion Endpoint
// In-memory store of conversion jobs. NOTE: on Vercel's serverless/edge
// runtime this is per-instance and not shared across invocations; it is
// sufficient for the typical single-instance / dev use case.
type YoutubeJob = {
  status: "processing" | "completed" | "error";
  title: string;
  duration: string;
  downloadUrl?: string;
  error?: string;
};
const youtubeJobs = new Map<string, YoutubeJob>();

app.post("/api/convert-youtube", async (req, res) => {
  try {
    const { url, bitrate } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const ytdlp = new YtDlp();

    // Fetch video metadata first (fast, before kicking off the heavy download).
    const info = await ytdlp.getInfoAsync<"video">(url);
    const title = (info.title || "YouTube Audio").replace(/[^a-z0-9_\-\s]/gi, "").trim().replace(/\s+/g, "_");
    const duration = info.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const jobId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    youtubeJobs.set(jobId, {
      status: "processing",
      title: info.title || "YouTube Audio",
      duration: durationFormatted,
    });

    // Respond immediately so we don't block the HTTP request for the full
    // (potentially long) download, which would time out on serverless hosts.
    res.json({
      jobId,
      title: info.title || "YouTube Audio",
      duration: durationFormatted,
      status: "processing",
    });

    // Process the conversion in the background.
    (async () => {
      try {
        const downloadDir = path.resolve(process.env.VITE_MP3_DOWNLOAD_DIR || "public/downloads");
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }

        const fileName = `${title}_${Date.now()}.mp3`;
        const outputPath = path.join(downloadDir, fileName);

        // Map bitrate string to numeric value (e.g. "320kbps" -> "320")
        const bitrateNum = (bitrate || "192kbps").replace(/[^0-9]/g, "") || "192";

        // Provide the bundled ffmpeg so audio extraction works in environments
        // without a system ffmpeg (e.g. Vercel / fresh deploys).
        const downloadOpts: any = {
          output: outputPath,
          extractAudio: true,
          audioFormat: "mp3",
          audioQuality: bitrateNum,
        };
        if (ffmpegPath) downloadOpts.ffmpegPath = ffmpegPath;

        await ytdlp.downloadAsync(url, downloadOpts);

        youtubeJobs.set(jobId, {
          status: "completed",
          title: info.title || "YouTube Audio",
          duration: durationFormatted,
          downloadUrl: `/api/download-youtube/${encodeURIComponent(fileName)}`,
        });
      } catch (error: any) {
        console.error("Error converting YouTube (background):", error);
        youtubeJobs.set(jobId, {
          status: "error",
          title: info.title || "YouTube Audio",
          duration: durationFormatted,
          error: error?.message || "Failed to convert YouTube video",
        });
      }
    })();
  } catch (error: any) {
    console.error("Error converting YouTube:", error);
    res.status(500).json({ error: error.message || "Failed to convert YouTube video" });
  }
});

// 7b. Poll conversion status (used by the client to wait for completion).
app.get("/api/convert-youtube/:jobId", (req, res) => {
  const job = youtubeJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ status: "error", error: "Unknown or expired job." });
  }
  res.json({ ...job });
});

// 8. Serve converted MP3s as a forced download.
// The browser ignores the `download` attribute on missing/non-same-origin
// resources and navigates instead (causing the "redirect" symptom), so we
// stream the file here with a Content-Disposition header.
app.get("/api/download-youtube/:file", (req, res) => {
  const fileName = req.params.file;
  // Prevent path traversal.
  if (!fileName || fileName.includes("/") || fileName.includes("..")) {
    return res.status(400).json({ error: "Invalid file name" });
  }
  const downloadDir = path.resolve(process.env.VITE_MP3_DOWNLOAD_DIR || "public/downloads");
  const filePath = path.join(downloadDir, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found or conversion failed." });
  }
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error streaming download:", err);
      if (!res.headersSent) res.status(500).json({ error: "Failed to stream file." });
    }
  });
});

export default app;

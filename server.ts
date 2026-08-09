import express from "express";
import app from "./api/index.js";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = parseInt(process.env.PORT || "3001", 10);

// Vite / Static file handling for local server development
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

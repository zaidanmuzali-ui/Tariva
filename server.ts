import { app } from "./app.js";
import { createServer as createViteServer } from "vite";
import path from "path";
import express from "express";

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Ensure API routes are not intercepted by Vite middleware
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      // delegate to vite for other routes (static, HMR, assets)
      return (vite.middlewares as any)(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TARIVA Server running on http://localhost:${PORT}`);
  });
}

startServer();

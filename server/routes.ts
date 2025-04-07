import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Static file-only application - all processing happens on the client side
  // We don't need any specific API routes for this application
  // since all file processing is done in-browser with JavaScript libraries

  // Endpoint to check server status - useful for health checks
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}

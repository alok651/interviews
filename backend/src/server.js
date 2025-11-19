import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngestClient, functions } from "./lib/inngest.js";

const app = express();

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Inngest endpoint
app.use("/api/inngest", serve({ client: inngestClient, functions }));

// Test routes
app.get("/health", (req, res) => res.json({ msg: "API is working" }));
app.get("/books", (req, res) => res.json({ msg: "Books API working" }));

// Production serve
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  // LAST route only
 app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

}

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = ENV.PORT || 3000;
    app.listen(PORT, () => console.log("Server running on", PORT));
  } catch (err) {
    console.error(err);
  }
};

startServer();

// backend/src/server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ ESM-safe __dirname
import { ENV } from './lib/env.js';
import { connectDB } from "./lib/db.js";
import cors from 'cors';
import { serve } from "inngest/express";
import { inngestClient, functions } from './lib/inngest.js'; // ✅ correct import

const app = express();

// ✅ ES module safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Inngest webhooks
app.use("/api/inngst", serve({ client: inngestClient, functions }));

// API routes
app.get('/health', (req, res) => {
    res.status(200).json({ msg: 'API is working' });
});

app.get('/books', (req, res) => {
    res.status(200).json({ msg: 'This is books API working' });
});

// Production frontend
if (ENV.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));

    // ✅ Catch-all route must be last
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}

// Start server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || ENV.PORT || 3000;

        app.listen(PORT, () => {
            console.log('Server running on', PORT);
        });

    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();

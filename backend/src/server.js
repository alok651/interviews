// backend/src/server.js

import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';
import { connectDB } from "./lib/db.js";
import cors from 'cors';
import { serve } from "inngest/express";
import { inngestClient, functions } from './lib/inngest.js';  // ✅ fixed import

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Middlewares
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Inngest (define functions before using)
app.use("/api/inngst", serve({ client: inngestClient, functions })); // ✅ fixed client

// Health route
app.get('/health', (req, res) => {
    res.status(200).json({ msg: 'API is working' });
});

// Example route
app.get('/books', (req, res) => {
    res.status(200).json({ msg: 'This is books API working' });
});

// Production frontend
if (ENV.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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

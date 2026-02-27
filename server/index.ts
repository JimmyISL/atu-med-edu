import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import migrate from './migrate.js';
import seed from './seed.js';
import dashboardRoutes from './routes/dashboard.js';
import peopleRoutes from './routes/people.js';
import coursesRoutes from './routes/courses.js';
import meetingsRoutes from './routes/meetings.js';
import cmeRoutes from './routes/cme.js';
import credentialsRoutes from './routes/credentials.js';
import uploadRoutes from './routes/upload.js';
import pathsRoutes from './routes/paths.js';
import actionsRoutes from './routes/actions.js';
import notesRoutes from './routes/notes.js';
import ssoRoutes from './routes/sso.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/cme', cmeRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/paths', pathsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/sso', ssoRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the Vite-built frontend
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - all non-API routes serve index.html (Express 5 syntax)
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function start() {
  try {
    // Run migrations
    console.log('Running migrations...');
    await migrate();

    // Seed if empty
    console.log('Checking seed data...');
    await seed();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  handleAdminVerify,
  handleGenerateProject,
  handleRefineProject,
} from './api/_lib/geminiBackend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.post('/api/admin/verify', (req, res) => {
    const result = handleAdminVerify(req.body);
    return res.status(result.status).json(result.payload);
  });

  app.post('/api/generate', async (req, res) => {
    const result = await handleGenerateProject(req.body);
    return res.status(result.status).json(result.payload);
  });

  app.post('/api/refine', async (req, res) => {
    const result = await handleRefineProject(req.body);
    return res.status(result.status).json(result.payload);
  });

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

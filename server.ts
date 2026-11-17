import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Generate website/app from prompt
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured. Please set your API key in the Settings > Secrets panel.' 
        });
      }

      const systemInstruction = `You are an elite frontend architect and expert full-stack web developer. 
Your task is to create a complete, stunning, fully functional, responsive single-page web application or website based on the user's prompt.
The output MUST be a JSON object with the following structure:
{
  "title": "Short catchy title for the app",
  "description": "One sentence description",
  "html": "The clean HTML structure (inside <body> without outer html/head wrapper, using Tailwind CSS classes)",
  "css": "Any custom CSS styles needed beyond Tailwind",
  "js": "Clean Vanilla JavaScript code for full interactivity, state management, event listeners, etc.",
  "fullCode": "A complete, self-contained standalone HTML document string containing <!DOCTYPE html>, Tailwind CSS CDN (<script src='https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'></script>), Lucide icons CDN if needed, custom CSS, and script tags so the app runs instantly in a sandbox."
}

Guidelines for the code:
1. Make it visually breathtaking with modern Tailwind styling (gradients, card shadows, rounded-2xl, glassmorphism, smooth hover states, dark/light compatibility).
2. Ensure full interactivity: forms work, modals open/close, tabs switch, state updates, counters increment/decrement, charts or lists populate with realistic sample data.
3. Include helpful placeholder data and empty states so the app looks alive and professional immediately upon loading.
4. Keep the HTML, CSS, and JS clean, robust, and error-free.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Create a complete web application or website for this idea: ${prompt}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              html: { type: Type.STRING },
              css: { type: Type.STRING },
              js: { type: Type.STRING },
              fullCode: { type: Type.STRING }
            },
            required: ['title', 'description', 'html', 'css', 'js', 'fullCode']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No response generated from Gemini AI.');
      }

      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error: any) {
      console.error('Generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate website' });
    }
  });

  // API Route: Refine / Iterate on existing website with chat prompt
  app.post('/api/refine', async (req, res) => {
    try {
      const { prompt, currentCode, conversationHistory } = req.body;
      if (!prompt || !currentCode) {
        return res.status(400).json({ error: 'Prompt and currentCode are required' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured.' 
        });
      }

      const systemInstruction = `You are an expert full-stack web developer assisting a user in refining their web application.
You are given the current code and the user's new request/feedback.
Modify and improve the code accordingly.
Return a JSON object with updated:
{
  "title": "Title",
  "description": "Description",
  "html": "Updated HTML",
  "css": "Updated CSS",
  "js": "Updated JS",
  "fullCode": "Updated complete standalone HTML document"
}`;

      const chatContent = `Current App HTML:
${currentCode.html || ''}

Current App CSS:
${currentCode.css || ''}

Current App JS:
${currentCode.js || ''}

User Request for Refinement: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: chatContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              html: { type: Type.STRING },
              css: { type: Type.STRING },
              js: { type: Type.STRING },
              fullCode: { type: Type.STRING }
            },
            required: ['title', 'description', 'html', 'css', 'js', 'fullCode']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No response generated from Gemini AI.');
      }

      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error: any) {
      console.error('Refinement error:', error);
      res.status(500).json({ error: error.message || 'Failed to refine website' });
    }
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

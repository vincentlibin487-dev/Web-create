import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

export interface ProjectFile {
  path: string;
  content: string;
}

const FREE_TIER_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
const ADMIN_PASSCODE_HASH = 'd6cfc211cfcbe6da718b48a62b60450f81651c633df4c4dbf3c10755ef09f082';
const slotCooldowns = new Map<string, number>();

export function getServerGeminiKeyPool(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY || '',
    ...(process.env.GEMINI_API_KEYS || '').split(','),
    process.env.GEMINI_API_KEY_2 || '',
    process.env.GEMINI_API_KEY_3 || '',
    process.env.GEMINI_API_KEY_4 || '',
    process.env.GEMINI_API_KEY_5 || '',
    process.env.GEMINI_API_KEY_6 || '',
  ]
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && !k.startsWith('MY_'));

  return Array.from(new Set(candidates));
}

export function isRetryableQuotaOrServerError(err: any): boolean {
  const status = err?.status || err?.code;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('high demand')
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeGeminiWithFallback(params: {
  preferredModel?: string;
  contents: any;
  config: any;
}) {
  const keyPool = getServerGeminiKeyPool();
  if (keyPool.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in Environment Variables / Secrets.');
  }

  const normalizedPref = FREE_TIER_MODELS.includes(params.preferredModel as any)
    ? (params.preferredModel as string)
    : FREE_TIER_MODELS[0];

  const modelQueue = [
    normalizedPref,
    ...FREE_TIER_MODELS.filter((m) => m !== normalizedPref),
  ];

  const now = Date.now();
  const attempts: { keyIndex: number; model: string }[] = [];

  for (const model of modelQueue) {
    for (let keyIndex = 0; keyIndex < keyPool.length; keyIndex++) {
      const slotKey = `${keyIndex}:${model}`;
      const cooldownUntil = slotCooldowns.get(slotKey) || 0;
      if (cooldownUntil > now) {
        continue;
      }
      attempts.push({ keyIndex, model });
    }
  }

  if (attempts.length === 0) {
    for (const model of modelQueue) {
      for (let keyIndex = 0; keyIndex < keyPool.length; keyIndex++) {
        attempts.push({ keyIndex, model });
      }
    }
  }

  let lastError: any = null;
  for (let i = 0; i < attempts.length; i++) {
    const { keyIndex, model } = attempts[i];
    const apiKey = keyPool[keyIndex];
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      return {
        response,
        usedModel: model,
        keySlot: keyIndex + 1,
        totalKeySlots: keyPool.length,
        fallbackUsed: i > 0,
      };
    } catch (err: any) {
      lastError = err;
      if (isRetryableQuotaOrServerError(err)) {
        slotCooldowns.set(`${keyIndex}:${model}`, Date.now() + 60_000);
        if (i < attempts.length - 1) {
          await sleep(Math.min(400 * (i + 1), 1200));
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models and API key slots are currently busy.');
}

function extractBalancedJsonObject(text: string): string | null {
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return text.slice(startIdx, i + 1);
        }
      }
    }
  }
  return null;
}

export function cleanAndParseGeminiJson<T = Record<string, any>>(rawText: string): T {
  const trimmed = String(rawText || '')
    .replace(/^\uFEFF/, '')
    .trim();

  if (!trimmed) {
    throw new Error('Gemini returned an empty response.');
  }

  const candidates: string[] = [trimmed];

  const fenceRegex = /```(?:json|JSON)?\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(trimmed)) !== null) {
    if (match[1]?.trim()) {
      candidates.push(match[1].trim());
    }
  }

  const strippedFence = trimmed
    .replace(/^```(?:json|JSON)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (strippedFence && strippedFence !== trimmed) {
    candidates.push(strippedFence);
  }

  const expandedCandidates: string[] = [];
  for (const cand of candidates) {
    expandedCandidates.push(cand);
    const balanced = extractBalancedJsonObject(cand);
    if (balanced && balanced !== cand) {
      expandedCandidates.push(balanced);
    }
    const firstBrace = cand.indexOf('{');
    const lastBrace = cand.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = cand.slice(firstBrace, lastBrace + 1);
      if (sliced !== cand && sliced !== balanced) {
        expandedCandidates.push(sliced);
      }
    }
  }

  let lastParseError: unknown = null;
  for (const candidate of expandedCandidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch (err) {
      lastParseError = err;
    }
  }

  const errMsg = lastParseError instanceof Error ? lastParseError.message : 'Invalid JSON structure';
  const parseErr: any = new Error(`AI returned an invalid JSON response (${errMsg}). Please try again.`);
  parseErr.code = 'INVALID_JSON_RESPONSE';
  throw parseErr;
}

export function parseBodySafely(body: any): Record<string, any> {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return typeof body === 'object' ? body : {};
}

export function handleAdminVerify(bodyInput: any): { status: number; payload: Record<string, any> } {
  try {
    const body = parseBodySafely(bodyInput);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!password) {
      return { status: 400, payload: { ok: false, error: 'Password is required' } };
    }

    const expectedHash = process.env.ADMIN_PASSWORD
      ? crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex')
      : ADMIN_PASSCODE_HASH;

    const providedHash = crypto.createHash('sha256').update(password).digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );

    if (!isValid) {
      return { status: 401, payload: { ok: false, error: 'Invalid admin password' } };
    }

    return { status: 200, payload: { ok: true } };
  } catch {
    return { status: 500, payload: { ok: false, error: 'Verification failed' } };
  }
}

export async function handleGenerateProject(bodyInput: any): Promise<{ status: number; payload: Record<string, any> }> {
  try {
    const body = parseBodySafely(bodyInput);
    const { prompt, attachment, projectName, preferredModel } = body;
    if (!prompt) {
      return { status: 400, payload: { error: 'Prompt is required' } };
    }

    if (getServerGeminiKeyPool().length === 0) {
      return {
        status: 500,
        payload: {
          error: 'GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY in Environment Variables / Secrets.',
        },
      };
    }

    const nameDirective = projectName?.trim()
      ? `\nIMPORTANT: The user has specified the exact Project Name: "${projectName.trim()}". You MUST use "${projectName.trim()}" as the exact <title> in index.html, prominently as the main header/brand logo text in the navigation bar/hero of the website, in the package.json "name", and as the "title" in the JSON response.`
      : '';

    const promptText = `Create a complete multi-file web project for this idea: ${prompt}.${nameDirective}`;
    let contents: any = promptText;
    if (attachment) {
      contents = {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: 'image/png',
              data: String(attachment).replace(/^data:image\/[a-z]+;base64,/, ''),
            },
          },
        ],
      };
    }

    const systemInstruction = `You are an elite full-stack software architect.
Your task is to create a complete, production-grade, multi-file web application based on the user's prompt.
You must return a JSON object containing a list of separate files and a standalone preview bundle:
{
  "title": "Short catchy app title (use exact user specified Project Name if provided)",
  "description": "One sentence description",
  "files": [
    { "path": "index.html", "content": "Complete HTML markup referencing style.css and script.js, plus Tailwind CSS CDN" },
    { "path": "style.css", "content": "Custom CSS styles" },
    { "path": "script.js", "content": "Vanilla JavaScript interactive logic" },
    { "path": "package.json", "content": "Standard npm package.json with dependencies" },
    { "path": "README.md", "content": "Project documentation and setup instructions" }
  ],
  "fullCode": "A self-contained single HTML document combining index.html, style.css, and script.js so it can be previewed instantly in a sandbox iframe."
}

Make sure all files contain pristine, production-ready code with gorgeous Tailwind styling and full interactivity.
CRITICAL: If the user provided a Project Name, it MUST appear as the <title> tag, the top navigation/header brand name, and the "title" attribute.
CRITICAL: Every generated index.html and fullCode MUST include <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"> and be 100% mobile-responsive, automatically fitting any smartphone or tablet screen seamlessly with zero horizontal scrolling or cut-offs.`;

    const { response, usedModel, fallbackUsed } = await executeGeminiWithFallback({
      preferredModel,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['path', 'content'],
              },
            },
            fullCode: { type: Type.STRING },
          },
          required: ['title', 'description', 'files', 'fullCode'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response generated from Gemini AI.');
    }

    const data = cleanAndParseGeminiJson<Record<string, any>>(responseText);
    if (!Array.isArray(data.files) || data.files.length === 0) {
      if (typeof data.fullCode === 'string' && data.fullCode.trim()) {
        data.files = [{ path: 'index.html', content: data.fullCode }];
      } else {
        throw Object.assign(new Error('AI response is missing generated project files. Please try again.'), {
          code: 'INVALID_JSON_RESPONSE',
        });
      }
    }
    if (projectName?.trim()) {
      data.title = projectName.trim();
    }
    data.usedModel = usedModel;
    data.fallbackUsed = fallbackUsed;
    return { status: 200, payload: data };
  } catch (error: any) {
    console.error('Generation error:', error);
    const isQuota = isRetryableQuotaOrServerError(error);
    const isParseError = error?.code === 'INVALID_JSON_RESPONSE';
    return {
      status: isQuota ? 429 : isParseError ? 502 : 500,
      payload: {
        error: error.message || 'Failed to generate project',
        code: isQuota ? 'RATE_LIMITED' : isParseError ? 'INVALID_JSON_RESPONSE' : 'GENERATION_ERROR',
      },
    };
  }
}

export async function handleRefineProject(bodyInput: any): Promise<{ status: number; payload: Record<string, any> }> {
  try {
    const body = parseBodySafely(bodyInput);
    const { prompt, attachment, currentFiles, projectTitle, preferredModel } = body;
    if (!prompt || !currentFiles) {
      return { status: 400, payload: { error: 'Prompt and currentFiles are required' } };
    }

    if (getServerGeminiKeyPool().length === 0) {
      return { status: 500, payload: { error: 'GEMINI_API_KEY is not configured.' } };
    }

    const filesSummary = (currentFiles as ProjectFile[])
      .map((f) => `=== FILE: ${f.path} ===\n${f.content}`)
      .join('\n\n');

    const promptText = `Refine and edit this project according to this instruction: ${prompt}`;
    let contents: any = promptText;
    if (attachment) {
      contents = {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: 'image/png',
              data: String(attachment).replace(/^data:image\/[a-z]+;base64,/, ''),
            },
          },
        ],
      };
    }

    const systemInstruction = `You are an expert full-stack developer and UI/UX designer assisting a user with editing and enhancing their existing multi-file web project in real-time.

Existing project title: "${projectTitle || 'Web Application'}"
Here are the current project files:
${filesSummary}

User Request for Live Edit: "${prompt}"

CRITICAL INSTRUCTIONS:
1. DO NOT discard or recreate the project from scratch!
2. Surgically apply the requested modifications (e.g. changing styles, updating buttons, adding interactive components, modifying layouts, adding sections, changing colors) to the existing files while preserving the overall design aesthetic, functionality, and unchanged files.
3. Keep the exact project title unless the user explicitly requested a title change.
4. Explain clearly in "explanation" what specific changes you performed in 2-3 friendly bullet points.
5. List the paths of all modified or newly created files in "modifiedFiles" (e.g. ["index.html", "style.css"]).
6. In "fullCode", provide the complete unified standalone HTML document merging index.html, style.css, and script.js with Tailwind CSS CDN, ensuring <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"> is present and it is 100% mobile-friendly with instant sandboxed live preview capability.`;

    const { response, usedModel, fallbackUsed } = await executeGeminiWithFallback({
      preferredModel,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            explanation: { type: Type.STRING },
            modifiedFiles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['path', 'content'],
              },
            },
            fullCode: { type: Type.STRING },
          },
          required: ['title', 'description', 'explanation', 'modifiedFiles', 'files', 'fullCode'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response generated from Gemini AI.');
    }

    const data = cleanAndParseGeminiJson<Record<string, any>>(responseText);
    if (!Array.isArray(data.files) || data.files.length === 0) {
      data.files = currentFiles;
    }
    if (projectTitle && !String(prompt).toLowerCase().includes('rename') && !String(prompt).toLowerCase().includes('change title')) {
      data.title = projectTitle;
    }
    data.usedModel = usedModel;
    data.fallbackUsed = fallbackUsed;
    return { status: 200, payload: data };
  } catch (error: any) {
    console.error('Refinement error:', error);
    const isQuota = isRetryableQuotaOrServerError(error);
    const isParseError = error?.code === 'INVALID_JSON_RESPONSE';
    return {
      status: isQuota ? 429 : isParseError ? 502 : 500,
      payload: {
        error: error.message || 'Failed to refine project',
        code: isQuota ? 'RATE_LIMITED' : isParseError ? 'INVALID_JSON_RESPONSE' : 'REFINEMENT_ERROR',
      },
    };
  }
}

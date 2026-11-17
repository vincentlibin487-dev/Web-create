import { handleGenerateProject, parseRequestBody, sendJson } from './_lib/geminiBackend.mjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }
    const body = await parseRequestBody(req);
    const result = await handleGenerateProject(body);
    return sendJson(res, result.status, result.payload);
  } catch (err) {
    console.error('Fatal /api/generate error:', err);
    return sendJson(res, 500, { error: err?.message || 'Internal server error' });
  }
}

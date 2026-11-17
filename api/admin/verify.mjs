import { handleAdminVerify, parseRequestBody, sendJson } from '../_lib/geminiBackend.mjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    }
    const body = await parseRequestBody(req);
    const result = handleAdminVerify(body);
    return sendJson(res, result.status, result.payload);
  } catch (err) {
    console.error('Fatal /api/admin/verify error:', err);
    return sendJson(res, 500, { ok: false, error: err?.message || 'Internal server error' });
  }
}

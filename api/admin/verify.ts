import { handleAdminVerify } from '../_lib/geminiBackend';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const result = handleAdminVerify(req.body);
  return res.status(result.status).json(result.payload);
}

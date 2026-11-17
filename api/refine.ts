import { handleRefineProject } from './_lib/geminiBackend';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const result = await handleRefineProject(req.body);
  return res.status(result.status).json(result.payload);
}

function extractFirstJsonObject(text: string): string | null {
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
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return text.slice(startIdx, i + 1);
        }
      }
    }
  }
  return null;
}

export function safeParseJsonString<T = Record<string, any>>(rawText: string): T | null {
  const trimmed = String(rawText || '').replace(/^\uFEFF/, '').trim();
  if (!trimmed) return null;

  const cleaned = trimmed
    .replace(/^```(?:json|JSON)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const candidates = [trimmed, cleaned];
  const balanced = extractFirstJsonObject(cleaned);
  if (balanced) candidates.push(balanced);

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return parsed as T;
      }
    } catch {
      // Try next cleaned candidate
    }
  }
  return null;
}

export async function safeParseFetchJson<T = Record<string, any>>(
  res: Response
): Promise<T & { error?: string; ok?: boolean; code?: string }> {
  let rawText = '';
  try {
    rawText = await res.text();
  } catch {
    return { error: `Network error (HTTP ${res.status})` } as any;
  }

  const parsed = safeParseJsonString<T & { error?: string; ok?: boolean; code?: string }>(rawText);
  if (parsed) {
    return parsed;
  }

  const isHtml = /^\s*</.test(rawText);
  return {
    error: isHtml
      ? `Server returned an unexpected response (HTTP ${res.status}). Please try again.`
      : rawText.slice(0, 200) || `Unexpected empty response (HTTP ${res.status})`,
  } as any;
}

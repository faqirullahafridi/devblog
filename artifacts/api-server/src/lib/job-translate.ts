import https from "node:https";
import tls from "node:tls";
import { cached } from "./memory-cache";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates });

const CACHE_TTL_MS = 7 * 24 * 60 * 60_000;
const MYMEMORY_API = "https://api.mymemory.translated.net/get";
const CHUNK_SIZE = 480;

const NON_ENGLISH_SOURCES = new Set(["arbeitnow"]);

const NON_ENGLISH_PATTERNS = [
  /\b(und|oder|mit|für|Sie|Ihre|Ihr|wir|unser|Entwickler|Entwicklerin|Stelle|Bewerbung|Deutschland|Berufserfahrung)\b/i,
  /\b(pour|avec|notre|vous|votre|poste|développeur|expérience|entreprise|français)\b/i,
  /\b(para|con|nuestro|desarrollador|experiencia|empresa|español)\b/i,
  /\b(per|con|nostro|sviluppatore|esperienza|azienda)\b/i,
  /\b(met|van|ontwikkelaar|ervaring|bedrijf)\b/i,
];

export function likelyNonEnglish(text: string, source?: string | null): boolean {
  if (!text.trim()) return false;
  if (source && NON_ENGLISH_SOURCES.has(source)) return true;

  const nonAscii = (text.match(/[^\x00-\x7F]/g) || []).length;
  if (nonAscii / text.length > 0.025) return true;

  return NON_ENGLISH_PATTERNS.some((pattern) => pattern.test(text));
}

function guessSourceLang(text: string, source?: string | null): string {
  if (source === "arbeitnow") return "de";
  if (/\b(pour|avec|développeur|expérience|entreprise)\b/i.test(text)) return "fr";
  if (/\b(para|desarrollador|experiencia|empresa)\b/i.test(text)) return "es";
  if (/\b(ontwikkelaar|ervaring|bedrijf)\b/i.test(text)) return "nl";
  if (/\b(sviluppatore|esperienza|azienda)\b/i.test(text)) return "it";
  if (/\b(und|für|Entwickler|Stelle|Bewerbung)\b/i.test(text)) return "de";
  return "de";
}

function chunkText(text: string, maxLen = CHUNK_SIZE): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    const separators = ["\n\n", "\n", ". ", " "];
    let cut = -1;
    for (const sep of separators) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx >= maxLen * 0.4) {
        cut = idx + (sep === ". " ? 2 : sep.length);
        break;
      }
    }
    if (cut <= 0) cut = maxLen;

    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  return chunks.filter(Boolean);
}

async function translateChunkLibre(text: string, fromLang: string): Promise<string> {
  const base = (process.env.LIBRETRANSLATE_URL?.trim() || "https://libretranslate.com").replace(/\/$/, "");
  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();

  const body: Record<string, string> = {
    q: text,
    source: fromLang,
    target: "en",
    format: "text",
  };
  if (apiKey) body.api_key = apiKey;

  const res = await fetch(`${base}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`LibreTranslate unavailable (${res.status})`);
  }

  const data = (await res.json()) as { translatedText?: string };
  const translated = data.translatedText?.trim() ?? "";
  if (!translated) throw new Error("LibreTranslate returned empty text");
  return translated;
}

async function translateChunk(text: string, fromLang: string, attempt = 0): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `${fromLang}|en`,
  });

  const email = process.env.MYMEMORY_EMAIL?.trim();
  if (email) params.set("de", email);

  const url = `${MYMEMORY_API}?${params.toString()}`;

  try {
    const data = await new Promise<{
      responseStatus: number;
      responseDetails: string;
      responseData?: { translatedText?: string };
    }>((resolve, reject) => {
      https
        .get(url, { agent: httpsAgent }, (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            if (res.statusCode === 429 && attempt < 3) {
              reject(Object.assign(new Error("RATE_LIMIT"), { retryable: true, status: 429 }));
              return;
            }
            if ((res.statusCode ?? 500) >= 400) {
              reject(new Error(`Translation service unavailable (${res.statusCode})`));
              return;
            }
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(err);
            }
          });
        })
        .on("error", reject);
    });

    const translated = data.responseData?.translatedText?.trim() ?? "";
    if (!translated) {
      throw new Error(data.responseDetails || "Translation failed");
    }

    if (translated.includes("MYMEMORY WARNING")) {
      throw new Error(
        "Daily free translation limit reached. Try again tomorrow, or set MYMEMORY_EMAIL in .env for a higher quota.",
      );
    }

    if (data.responseStatus !== 200 && !translated) {
      throw new Error(data.responseDetails || "Translation failed");
    }

    return translated;
  } catch (err) {
    if (err instanceof Error && err.message === "RATE_LIMIT" && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      return translateChunk(text, fromLang, attempt + 1);
    }
    try {
      return await translateChunkLibre(text, fromLang);
    } catch (libreErr) {
      throw err instanceof Error ? err : libreErr;
    }
  }
}

export async function translateToEnglish(text: string, source?: string | null): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";

  const fromLang = guessSourceLang(trimmed, source);
  const chunks = chunkText(trimmed);
  const parts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    parts.push(await translateChunk(chunks[i], fromLang));
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return parts.join("\n\n");
}

export async function translateJobField(
  slug: string,
  field: "description" | "requirements",
  text: string,
  source?: string | null,
): Promise<string> {
  const cacheKey = `job-translate:${slug}:${field}`;
  return cached(cacheKey, CACHE_TTL_MS, () => translateToEnglish(text, source));
}

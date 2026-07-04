#!/usr/bin/env node
/**
 * Quick probe: which AI providers respond for site-generation prompts.
 * Usage: node scripts/probe-ai-providers.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const env = readFileSync(resolve(root, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  console.warn("No .env found — using process env only");
}

const PROMPT =
  'Reply with exactly one ```html fence containing a minimal SaaS hero with nav and CTA. No React.';

function post(url, apiKey, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          ...extraHeaders,
        },
      },
      (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text }));
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

const probes = [];

const dsKey = process.env.DEEPSEEK_API_KEY?.trim();
if (dsKey) {
  probes.push({
    name: "deepseek",
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    run: () =>
      post("https://api.deepseek.com/v1/chat/completions", dsKey, {
        model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
        messages: [{ role: "user", content: PROMPT }],
        max_tokens: 400,
        temperature: 0.2,
      }),
  });
}

const nvKey =
  process.env.NVIDIA_CODE_KEY?.trim() ||
  process.env.NVIDIA_API_KEY?.trim();
if (nvKey) {
  for (const model of [
    process.env.NVIDIA_CODE_MODEL?.trim(),
    "deepseek-ai/deepseek-v4-flash",
    "qwen/qwen3.5-122b-a10b",
  ].filter(Boolean)) {
    probes.push({
      name: `nvidia:${model}`,
      model,
      run: () =>
        post("https://integrate.api.nvidia.com/v1/chat/completions", nvKey, {
          model,
          messages: [{ role: "user", content: PROMPT }],
          max_tokens: 400,
          temperature: 0.2,
        }),
    });
  }
}

const sfKey = process.env.SILICONFLOW_API_KEY?.trim();
if (sfKey) {
  probes.push({
    name: "siliconflow",
    model: process.env.SILICONFLOW_MODEL?.trim() || "deepseek-ai/DeepSeek-V3",
    run: () =>
      post("https://api.siliconflow.com/v1/chat/completions", sfKey, {
        model: process.env.SILICONFLOW_MODEL?.trim() || "deepseek-ai/DeepSeek-V3",
        messages: [{ role: "user", content: PROMPT }],
        max_tokens: 400,
        temperature: 0.2,
      }),
  });
}

const groqKey = process.env.GROQ_API_KEY?.trim();
if (groqKey) {
  probes.push({
    name: "groq",
    model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    run: () =>
      post("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: PROMPT }],
        max_tokens: 400,
        temperature: 0.2,
      }),
  });
}

if (!probes.length) {
  console.log("No API keys found. Set DEEPSEEK_API_KEY, NVIDIA_API_KEY, SILICONFLOW_API_KEY, or GROQ_API_KEY in .env");
  process.exit(1);
}

console.log(`Probing ${probes.length} provider(s) for static HTML generation...\n`);

for (const p of probes) {
  const t0 = Date.now();
  try {
    const { status, text } = await p.run();
    const ms = Date.now() - t0;
    let ok = status >= 200 && status < 300;
    let snippet = "";
    if (ok) {
      try {
        const json = JSON.parse(text);
        snippet = json.choices?.[0]?.message?.content?.slice(0, 120)?.replace(/\s+/g, " ") ?? "";
        ok = /```html|<!DOCTYPE|<html/i.test(snippet) || /```html|<!DOCTYPE|<html/i.test(text);
      } catch {
        ok = false;
        snippet = text.slice(0, 120);
      }
    } else {
      snippet = text.slice(0, 160).replace(/\s+/g, " ");
    }
    const mark = ok ? "OK" : status >= 400 ? "FAIL" : "WEAK";
    console.log(`${mark.padEnd(5)} ${p.name} (${p.model}) — ${status} — ${ms}ms`);
    if (!ok || mark === "WEAK") console.log(`       ${snippet}`);
  } catch (err) {
    console.log(`FAIL  ${p.name} — ${err instanceof Error ? err.message : err}`);
  }
}

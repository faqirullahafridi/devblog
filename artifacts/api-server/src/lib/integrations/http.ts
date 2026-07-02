import http from "node:http";
import https from "node:https";
import tls from "node:tls";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates });

export async function fetchJson<T>(url: string, init?: { headers?: Record<string, string> }): Promise<T> {
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;
  const headers = {
    "User-Agent": "devblog-platform/1.0",
    Accept: "application/json",
    ...init?.headers,
  };

  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: "GET",
        agent: isHttps ? httpsAgent : undefined,
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(body) as T);
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

export function getJson(url: string): Promise<{ status: number; text: string }> {
  const parsed = new URL(url);
  const lib = parsed.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    lib
      .get(url, { agent: parsed.protocol === "https:" ? httpsAgent : undefined }, (res) => {
        let text = "";
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 500, text }));
      })
      .on("error", reject);
  });
}

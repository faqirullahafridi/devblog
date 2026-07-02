import { cached } from "../memory-cache";
import { fetchJson } from "./http";

export async function getCountries(query?: string) {
  return cached(`utils:countries:${query ?? "all"}`, 24 * 60 * 60_000, async () => {
    const url = query?.trim()
      ? `https://restcountries.com/v3.1/name/${encodeURIComponent(query.trim())}?fields=name,cca2,cca3,capital,flags,population,region`
      : "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,flags,population,region";

    const data = await fetchJson<unknown[]>(url);
    return Array.isArray(data) ? data : [];
  });
}

export async function getExchangeRates(from = "USD", to?: string) {
  const base = from.toUpperCase();
  const cacheKey = `utils:fx:${base}:${to ?? "all"}`;
  return cached(cacheKey, 60 * 60_000, async () => {
    const url = to
      ? `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(to.toUpperCase())}`
      : `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`;
    return fetchJson<{ base: string; date: string; rates: Record<string, number> }>(url);
  });
}

export async function getGeoForIp(ip: string) {
  const clean = ip.replace(/^::ffff:/, "");
  if (!clean || clean === "unknown" || clean.startsWith("127.") || clean === "::1") {
    return { country: null, city: null, ip: clean };
  }

  return cached(`utils:geo:${clean}`, 60 * 60_000, async () => {
    try {
      return await fetchJson<{ country?: string; city?: string; ip?: string }>(
        `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(clean)}.json`,
      );
    } catch {
      try {
        const data = await fetchJson<{ country?: string; city?: string; query?: string }>(
          `http://ip-api.com/json/${encodeURIComponent(clean)}?fields=status,country,city,query`,
        );
        return { country: data.country ?? null, city: data.city ?? null, ip: data.query ?? clean };
      } catch {
        return { country: null, city: null, ip: clean };
      }
    }
  });
}

export async function getNpmPackage(name: string) {
  const pkg = name.trim();
  if (!pkg) throw new Error("Package name required");

  return cached(`utils:npm:${pkg}`, 30 * 60_000, async () => {
    return fetchJson(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
  });
}

export async function getCryptoPrices(ids = "bitcoin,ethereum") {
  return cached(`utils:crypto:${ids}`, 5 * 60_000, async () => {
    const key = process.env.COINGECKO_API_KEY?.trim();
    const headers: Record<string, string> = {};
    if (key) headers["x-cg-demo-api-key"] = key;

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
    return fetchJson<Record<string, { usd?: number; usd_24h_change?: number }>>(url, { headers });
  });
}

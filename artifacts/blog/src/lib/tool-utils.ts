/** Basic SQL formatter — keyword casing + line breaks. */
export function formatSql(sql: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "AS",
    "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN", "CROSS JOIN",
    "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
    "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
    "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "DISTINCT", "UNION", "UNION ALL",
  ];

  let out = sql.replace(/\s+/g, " ").trim();

  for (const kw of [...keywords].sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi"), kw);
  }

  const breakBefore = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
    "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "VALUES", "SET", "ON", "AND", "OR",
  ];

  for (const kw of breakBefore) {
    out = out.replace(new RegExp(`(?<!^)\\s+(${kw.replace(/ /g, "\\s+")})\\b`, "gi"), "\n$1");
  }

  return out
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^(AND|OR|ON)\b/i.test(trimmed)) return `  ${trimmed}`;
      return trimmed;
    })
    .join("\n");
}

export type DiffLine = { type: "same" | "add" | "remove"; line: string };

export function diffText(a: string, b: string): DiffLine[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: DiffLine[] = [];
  const max = Math.max(linesA.length, linesB.length);

  for (let i = 0; i < max; i++) {
    const la = linesA[i];
    const lb = linesB[i];
    if (la === lb) {
      if (la !== undefined) result.push({ type: "same", line: la });
    } else {
      if (la !== undefined) result.push({ type: "remove", line: la });
      if (lb !== undefined) result.push({ type: "add", line: lb });
    }
  }
  return result;
}

export function jsonToTypeScript(json: unknown, rootName = "Root"): string {
  const body = typeFromValue(json, rootName);
  return `export type ${rootName} = ${body};`;
}

function typeFromValue(value: unknown, nameHint: string): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const types = [...new Set(value.map((v, i) => typeFromValue(v, `${nameHint}Item${i}`)))];
    if (types.length === 1) return `${types[0]}[]`;
    return `(${types.join(" | ")})[]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "Record<string, never>";
    const props = entries.map(([key, val]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      return `  ${safeKey}: ${typeFromValue(val, key)};`;
    });
    return `{\n${props.join("\n")}\n}`;
  }
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "unknown";
}

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error("Invalid HEX color");
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

function describeField(field: string, unit: string, names?: Record<string, string>): string {
  if (field === "*") return `every ${unit}`;
  if (field.startsWith("*/")) return `every ${field.slice(2)} ${unit}s`;
  if (names && names[field]) return names[field];
  return `at ${unit} ${field}`;
}

export function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Cron expression must have 5 fields (minute hour day month weekday)");

  const [minute, hour, dom, month, dow] = parts;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (minute === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Runs every minute.";
  }

  if (minute === "0" && hour === "0" && dom === "*" && month === "*" && dow === "*") {
    return "Runs daily at midnight (00:00).";
  }

  if (minute === "0" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Runs every hour at minute 0.";
  }

  const chunks: string[] = [];
  chunks.push(describeField(minute, "minute"));
  chunks.push(describeField(hour, "hour"));
  chunks.push(describeField(dom, "day of month"));
  chunks.push(describeField(month, "month"));
  chunks.push(describeField(dow, "weekday", Object.fromEntries(days.map((d, i) => [String(i), d]))));

  let summary = `Schedule: ${chunks.join("; ")}.`;

  if (minute !== "*" && hour !== "*") {
    summary += ` Next-like run time: ${hour.padStart(2, "0")}:${minute.padStart(2, "0")} (server local time).`;
  }

  if (dow !== "*" && !Number.isNaN(Number(dow)) && days[Number(dow)]) {
    summary += ` On ${days[Number(dow)]}.`;
  }

  return summary;
}

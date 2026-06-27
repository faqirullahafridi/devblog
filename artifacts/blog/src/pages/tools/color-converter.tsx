import { useEffect, useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "@/lib/tool-utils";

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#06b6d4");
  const [r, setR] = useState("6");
  const [g, setG] = useState("182");
  const [b, setB] = useState("212");
  const [h, setH] = useState("189");
  const [s, setS] = useState("94");
  const [l, setL] = useState("43");
  const [error, setError] = useState("");

  const syncFromHex = (value: string) => {
    try {
      const rgb = hexToRgb(value);
      const hsl = rgbToHsl(rgb);
      setHex(rgbToHex(rgb));
      setR(String(rgb.r));
      setG(String(rgb.g));
      setB(String(rgb.b));
      setH(String(hsl.h));
      setS(String(hsl.s));
      setL(String(hsl.l));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid color");
    }
  };

  const syncFromRgb = (nr: number, ng: number, nb: number) => {
    const rgb = { r: nr, g: ng, b: nb };
    const hsl = rgbToHsl(rgb);
    setHex(rgbToHex(rgb));
    setR(String(nr));
    setG(String(ng));
    setB(String(nb));
    setH(String(hsl.h));
    setS(String(hsl.s));
    setL(String(hsl.l));
    setError("");
  };

  const syncFromHsl = (nh: number, ns: number, nl: number) => {
    const rgb = hslToRgb({ h: nh, s: ns, l: nl });
    const hsl = rgbToHsl(rgb);
    setHex(rgbToHex(rgb));
    setR(String(rgb.r));
    setG(String(rgb.g));
    setB(String(rgb.b));
    setH(String(hsl.h));
    setS(String(hsl.s));
    setL(String(hsl.l));
    setError("");
  };

  useEffect(() => {
    syncFromHex(hex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cssRgb = `rgb(${r}, ${g}, ${b})`;
  const cssHsl = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <ToolPageLayout
      title="Color Converter"
      description="Convert colors between HEX, RGB, and HSL with a live preview."
    >
      <div className="space-y-4">
        <ToolPanel label="Preview">
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-20 rounded-xl border shadow-inner shrink-0"
              style={{ backgroundColor: hex }}
            />
            <div className="space-y-1 text-sm font-mono text-muted-foreground break-all">
              <p>{hex}</p>
              <p>{cssRgb}</p>
              <p>{cssHsl}</p>
              <CopyButton value={`${hex}\n${cssRgb}\n${cssHsl}`} label="Copy all" />
            </div>
          </div>
        </ToolPanel>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          <ToolPanel label="HEX">
            <div className="space-y-2">
              <Label htmlFor="hex">#RRGGBB</Label>
              <Input
                id="hex"
                value={hex}
                onChange={(e) => {
                  setHex(e.target.value);
                  syncFromHex(e.target.value);
                }}
                className="font-mono"
              />
            </div>
          </ToolPanel>

          <ToolPanel label="RGB">
            <div className="grid grid-cols-3 gap-2">
              {(["r", "g", "b"] as const).map((ch) => (
                <div key={ch} className="space-y-1">
                  <Label className="uppercase">{ch}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={ch === "r" ? r : ch === "g" ? g : b}
                    onChange={(e) => {
                      const nr = Number(r);
                      const ng = Number(g);
                      const nb = Number(b);
                      const val = Number(e.target.value);
                      syncFromRgb(ch === "r" ? val : nr, ch === "g" ? val : ng, ch === "b" ? val : nb);
                    }}
                  />
                </div>
              ))}
            </div>
          </ToolPanel>

          <ToolPanel label="HSL">
            <div className="grid grid-cols-3 gap-2">
              {(["h", "s", "l"] as const).map((ch) => (
                <div key={ch} className="space-y-1">
                  <Label className="uppercase">{ch}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={ch === "h" ? 360 : 100}
                    value={ch === "h" ? h : ch === "s" ? s : l}
                    onChange={(e) => {
                      const nh = Number(h);
                      const ns = Number(s);
                      const nl = Number(l);
                      const val = Number(e.target.value);
                      syncFromHsl(ch === "h" ? val : nh, ch === "s" ? val : ns, ch === "l" ? val : nl);
                    }}
                  />
                </div>
              ))}
            </div>
          </ToolPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}

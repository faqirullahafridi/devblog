import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CodeEditor } from "@/components/platform/code-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/copy-button";
import { savePlayground, updatePlayground, sharePlayground } from "@/lib/platform-api";
import { toast } from "sonner";
import { Download, Link2, Loader2 } from "lucide-react";
import { platformEvents } from "@/lib/analytics";
import { runSqlQuery } from "@/lib/sql-playground";

type PlaygroundLang = "html-css-js" | "python" | "sql";

const DEFAULTS: Record<PlaygroundLang, Record<string, string>> = {
  "html-css-js": {
    html: "<h1>Hello DevTool</h1>\n<p>Edit HTML, CSS, and JS live.</p>",
    css: "body { font-family: system-ui; padding: 2rem; background: #0f172a; color: #e2e8f0; }\nh1 { color: #38bdf8; }",
    js: "console.log('Ready');",
  },
  python: {
    "main.py": 'print("Hello from Python")\nfor i in range(3):\n    print(f"Line {i}")',
  },
  sql: {
    "query.sql": "SELECT * FROM users LIMIT 5;",
  },
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<{ runPythonAsync: (code: string) => Promise<unknown> }>;
  }
}

type Props = {
  language: PlaygroundLang;
  initialSlug?: string;
  initialTitle?: string;
  initialFiles?: Record<string, string>;
  readOnly?: boolean;
};

export function PlaygroundWorkspace({ language, initialSlug, initialTitle, initialFiles, readOnly }: Props) {
  const defaults = initialFiles ?? DEFAULTS[language];
  const [files, setFiles] = useState(defaults);
  const [title, setTitle] = useState(initialTitle ?? "My snippet");
  const [slug, setSlug] = useState(initialSlug);
  const [output, setOutput] = useState("");
  const [sharing, setSharing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pyodideRef = useRef<{ runPythonAsync: (code: string) => Promise<unknown> } | null>(null);

  const fileKeys = Object.keys(files);
  const [activeFile, setActiveFile] = useState(fileKeys[0]);

  useEffect(() => {
    if (initialFiles) setFiles(initialFiles);
    if (initialTitle) setTitle(initialTitle);
    if (initialSlug) setSlug(initialSlug);
  }, [initialSlug, initialTitle, initialFiles]);

  useEffect(() => {
    if (language === "html-css-js") runHtmlPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFile(key: string, content: string) {
    if (readOnly) return;
    setFiles((prev) => ({ ...prev, [key]: content }));
  }

  function runHtmlPreview() {
    const html = files.html ?? "";
    const css = files.css ?? "";
    const js = files.js ?? "";
    const doc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
    if (iframeRef.current) iframeRef.current.srcdoc = doc;
    setOutput("Preview updated");
  }

  async function loadPyodide() {
    if (pyodideRef.current) return pyodideRef.current;
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Pyodide"));
        document.head.appendChild(s);
      });
    }
    pyodideRef.current = await window.loadPyodide!({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
    return pyodideRef.current;
  }

  async function runPython() {
    setOutput("Loading Python runtime…");
    try {
      const py = await loadPyodide();
      const code = files["main.py"] ?? Object.values(files)[0];
      await py.runPythonAsync(`
import sys
from io import StringIO
_buf = StringIO()
sys.stdout = _buf
`);
      await py.runPythonAsync(code);
      const out = await py.runPythonAsync("_buf.getvalue()");
      setOutput(String(out) || "(no output)");
    } catch (e) {
      setOutput(e instanceof Error ? e.message : String(e));
    }
  }

  async function runSql() {
    setOutput("Running query on sample database…");
    try {
      const query = files["query.sql"] ?? Object.values(files)[0];
      setOutput(await runSqlQuery(query));
    } catch (e) {
      setOutput(e instanceof Error ? e.message : String(e));
    }
  }

  function fileList() {
    return Object.entries(files).map(([filename, content]) => ({ filename, content }));
  }

  async function handleSave(publicSnippet: boolean) {
    try {
      const payload = { title, language, isPublic: publicSnippet, files: fileList() };
      const pg = slug
        ? await updatePlayground(slug, payload)
        : await savePlayground(payload);
      setSlug(pg.slug);
      platformEvents.playgroundSave(language, publicSnippet);
      toast.success(`Saved — share at /playground/${pg.slug}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleShare() {
    if (!slug) {
      toast.error("Save the snippet first");
      return;
    }
    setSharing(true);
    try {
      const { shareToken } = await sharePlayground(slug);
      const url = `${window.location.origin}/playground/share/${shareToken}`;
      await navigator.clipboard.writeText(url);
      platformEvents.playgroundShare(language);
      toast.success("Share link copied to clipboard (valid 30 days)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Share failed");
    } finally {
      setSharing(false);
    }
  }

  function downloadCode() {
    const blob = new Blob(
      [Object.entries(files).map(([name, content]) => `// ${name}\n${content}`).join("\n\n")],
      { type: "text/plain" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug ?? title}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-xs"
          placeholder="Snippet title"
          readOnly={readOnly}
        />
        {!readOnly && (
          <>
            <Button size="sm" type="button" onClick={() => handleSave(false)}>Save private</Button>
            <Button size="sm" type="button" variant="secondary" onClick={() => handleSave(true)}>Save public</Button>
            <Button size="sm" type="button" variant="outline" onClick={handleShare} disabled={sharing}>
              {sharing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Link2 className="h-4 w-4 mr-1" />}
              Share link
            </Button>
          </>
        )}
        <Button size="sm" type="button" variant="ghost" onClick={downloadCode}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
        {language === "html-css-js" && <Button size="sm" type="button" onClick={runHtmlPreview}>Run preview</Button>}
        {language === "python" && <Button size="sm" type="button" onClick={runPython}>Run Python</Button>}
        {language === "sql" && <Button size="sm" type="button" onClick={runSql}>Run SQL</Button>}
        {slug && <CopyButton value={`${window.location.origin}/playground/${slug}`} label="Copy URL" />}
      </div>

      <PanelGroup direction="horizontal" className="min-h-[420px] rounded-xl border">
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col border-r">
            <div className="flex gap-1 border-b p-2 overflow-x-auto">
              {fileKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActiveFile(k)}
                  className={`text-xs px-2 py-1 rounded ${activeFile === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <CodeEditor
              value={files[activeFile] ?? ""}
              onChange={(v) => updateFile(activeFile, v)}
              className="flex-1 border-0 rounded-none min-h-[360px]"
              minHeight="min-h-[360px]"
              readOnly={readOnly}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/30 transition-colors" />
        <Panel defaultSize={50} minSize={30}>
          {language === "html-css-js" ? (
            <iframe ref={iframeRef} title="preview" className="w-full h-full min-h-[420px] bg-white" sandbox="allow-scripts" />
          ) : (
            <div className="h-full p-4 bg-muted/30 overflow-auto">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Output</span>
                <CopyButton value={output} />
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap">{output || "Run to see output"}</pre>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}

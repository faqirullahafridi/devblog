import { useMemo, useState } from "react";
import { Link } from "wouter";
import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SNIPPETS,
  SNIPPET_LANGUAGES,
  SNIPPET_TAGS,
  getSnippetHref,
} from "@/lib/snippets-config";
import { Search } from "lucide-react";

export default function SnippetsIndexPage() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SNIPPETS.filter((s) => {
      if (language !== "all" && s.language !== language) return false;
      if (tag !== "all" && !s.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q))
      );
    });
  }, [query, language, tag]);

  return (
    <HubIndexLayout
      title="Code Snippets"
      description="45+ copy-paste snippets with full explanations — what each pattern does, when to use it, and how the code works."
      section="Snippets"
    >
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant={language === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setLanguage("all")}
          >
            All languages
          </Badge>
          {SNIPPET_LANGUAGES.map((lang) => (
            <Badge
              key={lang}
              variant={language === lang ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setLanguage(lang)}
            >
              {lang}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant={tag === "all" ? "secondary" : "outline"}
            className="cursor-pointer"
            onClick={() => setTag("all")}
          >
            All tags
          </Badge>
          {SNIPPET_TAGS.map((t) => (
            <Badge
              key={t}
              variant={tag === t ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => setTag(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground">No snippets match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((snippet) => (
            <Link
              key={snippet.slug}
              href={getSnippetHref(snippet.slug)}
              className="group rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold group-hover:text-primary transition-colors">{snippet.title}</h2>
                <Badge variant="outline" className="shrink-0 capitalize text-xs">
                  {snippet.language}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{snippet.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {snippet.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </HubIndexLayout>
  );
}

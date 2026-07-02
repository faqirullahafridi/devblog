import { ExternalLink, Key, KeyRound, Server, Zap } from "lucide-react";
import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { Badge } from "@/components/ui/badge";
import {
  API_SOURCES_PAGE,
  API_SOURCE_CATEGORIES,
  getApiSourceStats,
  getPricingLabel,
  type ApiPricing,
  type ApiSource,
} from "@/lib/api-sources-config";
import { cn } from "@/lib/utils";

function PricingBadge({ pricing }: { pricing: ApiPricing }) {
  const variants: Record<ApiPricing, string> = {
    free: "bg-[hsl(var(--success))] text-white border-foreground",
    "free-tier": "bg-primary text-primary-foreground border-foreground",
    "optional-paid": "bg-muted text-foreground border-foreground",
    "self-hosted": "bg-card text-foreground border-foreground",
  };
  return (
    <Badge className={cn("text-[10px] font-black uppercase tracking-wider border-2", variants[pricing])}>
      {getPricingLabel(pricing)}
    </Badge>
  );
}

const cardBodyText =
  "min-w-0 max-w-full w-full break-all [overflow-wrap:anywhere] text-muted-foreground leading-relaxed";

function ApiSourceCard({ source }: { source: ApiSource }) {
  return (
    <li className="flex h-full min-w-0 max-w-full flex-col overflow-x-hidden border-2 border-foreground bg-card p-5 brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow transition-all">
      <div className="mb-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-black text-lg leading-tight">{source.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PricingBadge pricing={source.pricing} />
            {source.requiresKey ? (
              <Badge variant="outline" className="text-[10px] font-black uppercase border-2 border-foreground">
                API key
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-black uppercase border-2 border-foreground">
                No key
              </Badge>
            )}
          </div>
        </div>
        <a
          href={source.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline"
        >
          Docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="mb-3 min-w-0 max-w-full break-all text-sm font-medium text-foreground [overflow-wrap:anywhere]">
        {source.summary}
      </p>

      <dl className="min-w-0 max-w-full w-full space-y-3 text-sm">
        <div className="min-w-0 max-w-full">
          <dt className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary">Great for</dt>
          <dd className={cardBodyText}>{source.idealFor}</dd>
        </div>
        <div className="min-w-0 max-w-full">
          <dt className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary">How it works</dt>
          <dd className={cardBodyText}>{source.howItWorks}</dd>
        </div>
        {source.freeLimits && (
          <div className="min-w-0 max-w-full">
            <dt className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary">Free tier limits</dt>
            <dd className={cardBodyText}>{source.freeLimits}</dd>
          </div>
        )}
        {source.envVars && source.envVars.length > 0 && (
          <div className="min-w-0">
            <dt className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary">Typical env vars</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {source.envVars.map((v) => (
                <code
                  key={v}
                  className="max-w-full break-all text-[11px] font-mono bg-muted px-2 py-0.5 border-2 border-foreground"
                >
                  {v}
                </code>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {source.signupUrl && (
        <a
          href={source.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 break-words text-xs font-black uppercase tracking-wider text-primary hover:underline"
        >
          Get API key / Sign up <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      )}
    </li>
  );
}

export default function ApiSourcesPage() {
  const stats = getApiSourceStats();

  return (
    <HubIndexLayout
      title={API_SOURCES_PAGE.title}
      description={API_SOURCES_PAGE.description}
      section="Platform"
    >
      <div className="mb-12 grid grid-cols-2 gap-[2px] border-2 border-foreground bg-foreground brutal-shadow-sm md:grid-cols-4">
        {[
          { label: "Total APIs", value: stats.total, icon: Server },
          { label: "Categories", value: stats.categories, icon: Zap },
          { label: "Free / no key", value: stats.freeNoKey, icon: KeyRound },
          { label: "Need API key", value: stats.requiresKey, icon: Key },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="min-w-0 bg-card p-4 text-center sm:p-5">
            <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-1 break-words text-[10px] font-black uppercase leading-snug tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-10 border-2 border-foreground bg-muted/40 p-5 brutal-shadow-sm text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground font-bold">Security tip:</strong> Keep API keys on your server only.
          Proxy third-party calls through your backend and store secrets in environment variables — never in frontend
          code or public repos.
        </p>
      </div>

      <div className="space-y-14">
        {API_SOURCE_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xl font-black tracking-tight">{cat.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">{cat.description}</p>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0 [&>*]:max-w-full">
              {cat.sources.map((source) => (
                <ApiSourceCard key={source.id} source={source} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </HubIndexLayout>
  );
}

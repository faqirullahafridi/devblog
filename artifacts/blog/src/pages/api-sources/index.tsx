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

function ApiSourceCard({ source }: { source: ApiSource }) {
  return (
    <li className="flex h-full flex-col border-2 border-foreground bg-card p-5 brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-lg">{source.name}</h3>
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
        <a
          href={source.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline shrink-0"
        >
          Docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <p className="text-sm font-medium text-foreground mb-3">{source.summary}</p>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">Great for</dt>
          <dd className="text-muted-foreground leading-relaxed">{source.idealFor}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">How it works</dt>
          <dd className="text-muted-foreground leading-relaxed">{source.howItWorks}</dd>
        </div>
        {source.freeLimits && (
          <div>
            <dt className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">Free tier limits</dt>
            <dd className="text-muted-foreground leading-relaxed">{source.freeLimits}</dd>
          </div>
        )}
        {source.envVars && source.envVars.length > 0 && (
          <div>
            <dt className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">Typical env vars</dt>
            <dd className="flex flex-wrap gap-1.5 mt-1">
              {source.envVars.map((v) => (
                <code key={v} className="text-[11px] font-mono bg-muted px-2 py-0.5 border-2 border-foreground">
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
          className="inline-flex items-center gap-1 mt-4 text-xs font-black uppercase tracking-wider text-primary hover:underline"
        >
          Get API key / Sign up <ExternalLink className="h-3 w-3" />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-foreground border-2 border-foreground brutal-shadow-sm mb-12">
        {[
          { label: "Total APIs", value: stats.total, icon: Server },
          { label: "Categories", value: stats.categories, icon: Zap },
          { label: "Free / no key", value: stats.freeNoKey, icon: KeyRound },
          { label: "Need API key", value: stats.requiresKey, icon: Key },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card p-5 text-center">
            <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
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
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

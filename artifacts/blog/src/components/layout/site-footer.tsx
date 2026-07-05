import { Link } from "wouter";
import { SITE_NAME } from "@/lib/site-config";
import { BrandLogo } from "@/components/brand-logo";
import { isNonSpaPath } from "@/components/seo-document-reload";
import {
  PLATFORM_LINKS,
  CONTENT_LINKS,
  RESOURCE_LINKS,
  LEGAL_LINKS,
  PRIMARY_PAGE_LINKS,
} from "@/lib/nav-config";

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={item.href}>
            {isNonSpaPath(item.href) ? (
              <a
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex hover:opacity-90 transition-opacity">
              <BrandLogo />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Developer tools, learning paths, and a growing platform for builders.
            </p>
            <Link href="/search" className="text-sm text-primary hover:underline inline-block">
              Search the site →
            </Link>
          </div>

          <FooterColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterColumn title="Content" links={CONTENT_LINKS} />
          <FooterColumn title="Resources" links={[...RESOURCE_LINKS, ...PRIMARY_PAGE_LINKS.slice(0, 2)]} />
          <FooterColumn title="Legal & help" links={[...LEGAL_LINKS, { href: "/about", label: "About Us" }, { href: "/feed.xml", label: "RSS Feed" }]} />
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME}. Built with craft.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
            <Link href="/developer" className="hover:text-foreground transition-colors">Developer</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

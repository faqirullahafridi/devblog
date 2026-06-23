import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold tracking-tight text-lg flex items-center gap-2">
              <div className="size-6 bg-primary rounded-sm" />
              DevBlog
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/category/html-css" className="hover:text-foreground transition-colors">HTML/CSS</Link>
              <Link href="/category/javascript" className="hover:text-foreground transition-colors">JavaScript</Link>
              <Link href="/category/python" className="hover:text-foreground transition-colors">Python</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span className="sr-only">Search</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-12 bg-muted/40">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DevBlog. Built with craft.</p>
        </div>
      </footer>
    </div>
  );
}

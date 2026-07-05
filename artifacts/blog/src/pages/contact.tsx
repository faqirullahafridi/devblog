import { useState } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { useGetDeveloperProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { submitContact } from "@/lib/api-extra";
import { SeoHead } from "@/components/seo-head";
import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, seoTitle } from "@/lib/site-config";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";
import { PageHeader } from "@/components/layout/page-header";

export default function ContactPage() {
  const { data: profile } = useGetDeveloperProfile();
  const contactEmail = profile?.email ?? SITE_EMAIL;
  const location = profile?.location ?? "Peshawar, Pakistan";
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const message = String(form.get("message") ?? "");

    setSending(true);
    try {
      await submitContact({ name, email, message });
      toast.success("Message sent! We'll get back to you soon.");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicLayout>
      <SeoHead title={seoTitle("Contact")} description={`Get in touch with the ${SITE_NAME} team.`} />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <PageHeader
          title="Contact Us"
          description="Have a question, feedback, or advertising inquiry? We'd love to hear from you."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
          align="center"
          className="mb-10"
        />

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Email</p>
              <a href={`mailto:${contactEmail}`} className="text-sm text-primary hover:underline break-all">
                {contactEmail}
              </a>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Location</p>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border rounded-xl bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={5} placeholder="How can we help?" />
          </div>
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <HubSeoIntro path="/contact" />

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          {" · "}
          <Link href="/about" className="text-primary hover:underline">About</Link>
          {" · "}
          <Link href="/developer" className="text-primary hover:underline">Developer Profile</Link>
        </p>
      </div>
    </PublicLayout>
  );
}

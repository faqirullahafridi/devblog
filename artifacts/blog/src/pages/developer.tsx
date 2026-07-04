import { PublicLayout } from "@/components/layout/public-layout";
import { useGetDeveloperProfile } from "@workspace/api-client-react";
import { Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";

export default function DeveloperPage() {
  const { data: profile, isLoading, isError } = useGetDeveloperProfile();

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse space-y-8">
          <div className="h-12 bg-muted rounded w-2/3" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !profile) {
    return (
      <PublicLayout>
        <SeoHead title={seoTitle("Developer Profile")} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Profile not available</h1>
          <p className="text-muted-foreground mt-2">Check back soon.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SeoHead
        title={`${profile.name} — Developer Profile`}
        description={profile.headline || profile.aboutMe?.slice(0, 160)}
      />
      <div className="border-b-2 border-foreground bg-muted">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Developer profile
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{profile.name}</h1>
          {profile.headline && (
            <p className="text-xl text-muted-foreground mt-3">{profile.headline}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
            {profile.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {profile.phone}
              </span>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
                {profile.email}
              </a>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
        {profile.aboutMe && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">About Me</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.aboutMe}</p>
          </section>
        )}

        {profile.workExperience.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Work Experience</h2>
            <div className="space-y-8">
              {profile.workExperience.map((job, i) => (
                <div key={i} className="border-l-4 border-primary pl-5">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.period ? `${job.company} · ${job.period}` : job.company}
                  </p>
                  {job.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                      {job.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.education.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Education</h2>
            <div className="space-y-4">
              {profile.education.map((edu, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution} · {edu.period}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Key Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.projects.map((project, i) => (
                <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.technicalSkills.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Technical Skills</h2>
            <div className="space-y-3">
              {profile.technicalSkills.map((skill, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:gap-4 text-sm">
                  <span className="font-medium sm:w-32 shrink-0">{skill.category}</span>
                  <span className="text-muted-foreground">{skill.items}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.languages.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {profile.languages.map((lang, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm"
                >
                  <span className="font-medium">{lang.name}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{lang.level}</span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

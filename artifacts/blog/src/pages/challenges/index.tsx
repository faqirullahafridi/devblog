import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PlatformHubLayout, PlatformCard, PlatformCardGrid } from "@/components/platform/platform-hub-layout";
import { listChallenges, getDailyChallenge } from "@/lib/platform-api";
import { Badge } from "@/components/ui/badge";

export default function ChallengesIndexPage() {
  const { data: daily } = useQuery({ queryKey: ["challenge-daily"], queryFn: getDailyChallenge });
  const { data, isLoading } = useQuery({ queryKey: ["challenges"], queryFn: () => listChallenges() });

  return (
    <PlatformHubLayout
      title="Coding Challenges"
      description="Practice JavaScript, algorithms, and more. Submit solutions, earn points, and climb the leaderboard."
      section="Platform"
    >
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/challenges/leaderboard" className="text-sm text-primary hover:underline">Leaderboard →</Link>
        {daily && (
          <Link href={`/challenges/${daily.slug}`} className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
            Today&apos;s challenge: {daily.title}
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.challenges.map((c) => (
            <Link key={c.slug} href={`/challenges/${c.slug}`} className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors">
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{c.difficulty}</Badge>
                <Badge variant="secondary">{c.category}</Badge>
              </div>
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-xs text-muted-foreground mt-2">{c.points} pts</p>
            </Link>
          ))}
        </div>
      )}
    </PlatformHubLayout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { getLeaderboard } from "@/lib/platform-api";

export default function ChallengeLeaderboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: getLeaderboard });

  return (
    <PlatformHubLayout title="Leaderboard" description="Top challengers by points." section="Challenges" backHref="/challenges" backLabel="Challenges">
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}</div>
      ) : (
        <ol className="space-y-2">
          {data?.map((row, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <span className="font-medium">#{i + 1} {row.authorName}</span>
              <span className="text-sm text-muted-foreground">{row.totalPoints} pts · {row.challengesSolved} solved</span>
            </li>
          ))}
          {data?.length === 0 && <p className="text-muted-foreground text-sm">No submissions yet. Be the first!</p>}
        </ol>
      )}
    </PlatformHubLayout>
  );
}

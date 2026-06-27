import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateRoadmap, getRoadmapOptions } from "@/lib/platform-api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { platformEvents } from "@/lib/analytics";

export default function RoadmapGeneratorPage() {
  const [, setLocation] = useLocation();
  const { data: options } = useQuery({ queryKey: ["roadmap-options"], queryFn: getRoadmapOptions });
  const [level, setLevel] = useState("beginner");
  const [goal, setGoal] = useState("full-stack-developer");

  const gen = useMutation({
    mutationFn: () => generateRoadmap(level, goal),
    onSuccess: (data) => {
      platformEvents.roadmapGenerate(goal, level);
      setLocation(`/roadmaps/generated/${data.slug}`);
    },
  });

  return (
    <PlatformHubLayout title="Roadmap Generator" description="Select your current level and target role." section="Roadmaps" backHref="/roadmaps" backLabel="Roadmaps">
      <div className="max-w-md space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label>Current level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {options?.levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {options?.goals.map((g) => <SelectItem key={g.slug} value={g.slug}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => gen.mutate()} disabled={gen.isPending}>
          {gen.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Generate roadmap
        </Button>
      </div>
    </PlatformHubLayout>
  );
}

import { AdminLayout } from "@/components/layout/admin-layout";
import { useParams, useLocation } from "wouter";
import { useGetAuthMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { listAdminChallengesManual, createChallengeManual, updateChallengeManual } from "@/lib/platform-api";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CATEGORIES = ["JavaScript", "React", "Node", "Python", "SQL", "Algorithms", "Data Structures"];

export default function AdminChallengeEditorPage() {
  useGetAuthMe();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = params.id === "new";
  const challengeId = isNew ? null : parseInt(params.id ?? "0", 10);

  const { data: adminList } = useQuery({
    queryKey: ["admin-challenges-edit", challengeId],
    queryFn: () => listAdminChallengesManual(),
    enabled: !isNew && !!challengeId,
  });

  const existing = adminList?.challenges.find((c) => c.id === challengeId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [category, setCategory] = useState("JavaScript");
  const [starterCode, setStarterCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [testCasesJson, setTestCasesJson] = useState('[{"input":"[]","expected":"true"}]');
  const [points, setPoints] = useState(10);
  const [isDaily, setIsDaily] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setDescription(existing.description);
    setDifficulty(existing.difficulty);
    setCategory(existing.category);
    setStarterCode(existing.starterCode);
    setSolutionCode(existing.solutionCode ?? "");
    setTestCasesJson(JSON.stringify(existing.testCases ?? [], null, 2));
    setPoints(existing.points);
    setIsDaily(existing.isDaily ?? false);
  }, [existing?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const testCases = JSON.parse(testCasesJson);
      const payload = {
        title,
        description,
        difficulty,
        category,
        starterCode,
        solutionCode: solutionCode || undefined,
        testCases,
        points,
        isDaily,
      };
      if (isNew) {
        await createChallengeManual(payload);
        toast.success("Challenge created");
      } else if (challengeId) {
        await updateChallengeManual(challengeId, payload);
        toast.success("Challenge updated");
      }
      setLocation("/admin/challenges");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{isNew ? "New challenge" : "Edit challenge"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Description (Markdown)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Starter code</Label>
            <Textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} rows={6} className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Solution code</Label>
            <Textarea value={solutionCode} onChange={(e) => setSolutionCode(e.target.value)} rows={6} className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Test cases (JSON array)</Label>
            <Textarea value={testCasesJson} onChange={(e) => setTestCasesJson(e.target.value)} rows={6} className="font-mono text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isDaily} onCheckedChange={setIsDaily} id="daily" />
            <Label htmlFor="daily">Daily challenge</Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saving}>{isNew ? "Create" : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/admin/challenges")}>Cancel</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

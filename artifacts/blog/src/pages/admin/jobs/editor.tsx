import { AdminLayout } from "@/components/layout/admin-layout";
import { useParams, useLocation } from "wouter";
import { useGetAuthMe, useCreateJob, useUpdateJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { listAdminJobsManual } from "@/lib/platform-api";

const CATEGORIES = [
  "frontend", "backend", "full-stack", "react", "nodejs", "django", "python", "qa", "devops", "remote",
];

export default function AdminJobEditorPage() {
  useGetAuthMe();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = params.id === "new";
  const jobId = isNew ? null : parseInt(params.id ?? "0", 10);

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const { data: adminList } = useQuery({
    queryKey: ["admin-jobs-edit", jobId],
    queryFn: () => listAdminJobsManual(),
    enabled: !isNew && !!jobId,
  });

  const existing = adminList?.jobs.find((j) => j.id === jobId);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocationVal] = useState("Remote");
  const [remote, setRemote] = useState(true);
  const [salaryRange, setSalaryRange] = useState("");
  const [category, setCategory] = useState("full-stack");
  const [applyUrl, setApplyUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setCompany(existing.company);
    setDescription(existing.description);
    setRequirements(existing.requirements);
    setLocationVal(existing.location);
    setRemote(existing.remote);
    setSalaryRange(existing.salaryRange ?? "");
    setCategory(existing.category);
    setApplyUrl(existing.applyUrl);
    setExpiresAt(existing.expiresAt?.slice(0, 10) ?? "");
    setIsActive(existing.isActive);
  }, [existing?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      company,
      description,
      requirements,
      location,
      remote,
      salaryRange: salaryRange || undefined,
      category,
      applyUrl,
      expiresAt: expiresAt || undefined,
      isActive,
    };
    try {
      if (isNew) {
        await createJob.mutateAsync({ data: payload });
        toast.success("Job created");
      } else if (jobId) {
        await updateJob.mutateAsync({ id: jobId, data: payload });
        toast.success("Job updated");
      }
      setLocation("/admin/jobs");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{isNew ? "New job" : "Edit job"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
          </div>
          <div className="space-y-2">
            <Label>Requirements</Label>
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocationVal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Salary range</Label>
              <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="$100k–$130k" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
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
              <Label>Apply URL</Label>
              <Input value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} type="url" required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expires</Label>
              <Input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" />
            </div>
            <div className="flex items-center gap-3 pt-8">
              <Switch checked={remote} onCheckedChange={setRemote} id="remote" />
              <Label htmlFor="remote">Remote</Label>
            </div>
          </div>
          {!isNew && (
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
              <Label htmlFor="active">Active listing</Label>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createJob.isPending || updateJob.isPending}>
              {isNew ? "Create" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/admin/jobs")}>Cancel</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

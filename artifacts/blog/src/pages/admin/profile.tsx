import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useGetDeveloperProfileManage,
  useUpdateDeveloperProfile,
  getGetDeveloperProfileManageQueryKey,
  type DeveloperProfileUpdate,
  type ProfileWorkExperience,
  type ProfileEducation,
  type ProfileProject,
  type ProfileSkillGroup,
  type ProfileLanguage,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react";

const emptyWork = (): ProfileWorkExperience => ({
  title: "",
  company: "",
  period: "",
  bullets: [""],
});

const emptyEducation = (): ProfileEducation => ({
  degree: "",
  institution: "",
  period: "",
});

const emptyProject = (): ProfileProject => ({ name: "", description: "" });
const emptySkill = (): ProfileSkillGroup => ({ category: "", items: "" });
const emptyLanguage = (): ProfileLanguage => ({ name: "", level: "" });

export default function AdminProfile() {
  const { data: profile, isLoading } = useGetDeveloperProfileManage();
  const updateProfile = useUpdateDeveloperProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<DeveloperProfileUpdate>({
    name: "",
    headline: "",
    phone: "",
    email: "",
    location: "",
    portfolioUrl: "",
    aboutMe: "",
    workExperience: [],
    education: [],
    projects: [],
    technicalSkills: [],
    languages: [],
    status: "published",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        headline: profile.headline ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        location: profile.location ?? "",
        portfolioUrl: profile.portfolioUrl ?? "",
        aboutMe: profile.aboutMe ?? "",
        workExperience: profile.workExperience,
        education: profile.education,
        projects: profile.projects,
        technicalSkills: profile.technicalSkills,
        languages: profile.languages,
        status: profile.status as "draft" | "published",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ data: form });
      queryClient.invalidateQueries({ queryKey: getGetDeveloperProfileManageQueryKey() });
      toast.success("Profile saved");
    } catch (err) {
      const msg = err instanceof ApiError ? (err.data as { error?: string })?.error : null;
      toast.error(msg ?? "Failed to save profile");
    }
  };

  const updateList = <T,>(key: keyof DeveloperProfileUpdate, index: number, value: T) => {
    setForm((prev) => {
      const list = [...(prev[key] as T[])];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };

  const addItem = <T,>(key: keyof DeveloperProfileUpdate, item: T) => {
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] as T[]), item] }));
  };

  const removeItem = (key: keyof DeveloperProfileUpdate, index: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as unknown[]).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse h-40 bg-muted rounded-lg" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Developer Profile</h1>
            <p className="text-muted-foreground mt-1">Edit your public resume page at /developer</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={form.status === "published"}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, status: checked ? "published" : "draft" }))
              }
            />
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Basic info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Portfolio URL</Label>
              <Input value={form.portfolioUrl} onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>About me</Label>
            <Textarea rows={4} value={form.aboutMe} onChange={(e) => setForm((p) => ({ ...p, aboutMe: e.target.value }))} />
          </div>
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Work experience</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("workExperience", emptyWork())}>
              Add role
            </Button>
          </div>
          {form.workExperience?.map((job, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Input placeholder="Title" value={job.title} onChange={(e) => updateList("workExperience", i, { ...job, title: e.target.value })} />
                <Input placeholder="Company" value={job.company} onChange={(e) => updateList("workExperience", i, { ...job, company: e.target.value })} />
                <Input placeholder="Period" value={job.period} onChange={(e) => updateList("workExperience", i, { ...job, period: e.target.value })} />
              </div>
              <Textarea
                placeholder="Bullet points (one per line)"
                rows={3}
                value={job.bullets.join("\n")}
                onChange={(e) =>
                  updateList("workExperience", i, {
                    ...job,
                    bullets: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem("workExperience", i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Education</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("education", emptyEducation())}>
              Add education
            </Button>
          </div>
          {form.education?.map((edu, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-3 border rounded-lg p-4">
              <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateList("education", i, { ...edu, degree: e.target.value })} />
              <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateList("education", i, { ...edu, institution: e.target.value })} />
              <Input placeholder="Period" value={edu.period} onChange={(e) => updateList("education", i, { ...edu, period: e.target.value })} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive sm:col-span-3" onClick={() => removeItem("education", i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("projects", emptyProject())}>
              Add project
            </Button>
          </div>
          {form.projects?.map((project, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Input placeholder="Project name" value={project.name} onChange={(e) => updateList("projects", i, { ...project, name: e.target.value })} />
              <Textarea placeholder="Description" rows={2} value={project.description} onChange={(e) => updateList("projects", i, { ...project, description: e.target.value })} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem("projects", i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Technical skills</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("technicalSkills", emptySkill())}>
              Add skill group
            </Button>
          </div>
          {form.technicalSkills?.map((skill, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 border rounded-lg p-4">
              <Input placeholder="Category" value={skill.category} onChange={(e) => updateList("technicalSkills", i, { ...skill, category: e.target.value })} />
              <Input placeholder="Items (comma-separated)" value={skill.items} onChange={(e) => updateList("technicalSkills", i, { ...skill, items: e.target.value })} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive sm:col-span-2" onClick={() => removeItem("technicalSkills", i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Languages</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => addItem("languages", emptyLanguage())}>
              Add language
            </Button>
          </div>
          {form.languages?.map((lang, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 border rounded-lg p-4">
              <Input placeholder="Language" value={lang.name} onChange={(e) => updateList("languages", i, { ...lang, name: e.target.value })} />
              <Input placeholder="Level" value={lang.level} onChange={(e) => updateList("languages", i, { ...lang, level: e.target.value })} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive sm:col-span-2" onClick={() => removeItem("languages", i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </AdminLayout>
  );
}

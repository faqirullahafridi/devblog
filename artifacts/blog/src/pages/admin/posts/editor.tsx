import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetPost, useCreatePost, useUpdatePost, useListCategories, getListPostsQueryKey, getGetPostQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function PostEditor() {
  const params = useParams<{ id?: string }>();
  const isNew = !params.id || params.id === "new";
  const id = isNew ? undefined : parseInt(params.id!);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useGetPost(id!, { query: { enabled: !!id } });
  const { data: categories } = useListCategories();

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      featuredImage: "",
      categoryId: undefined,
      seoTitle: "",
      metaDescription: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || "",
        featuredImage: post.featuredImage || "",
        categoryId: post.categoryId || undefined,
        seoTitle: post.seoTitle || "",
        metaDescription: post.metaDescription || "",
        status: post.status,
      });
    }
  }, [post, form]);

  const onSubmit = async (values: PostFormValues) => {
    try {
      if (isNew) {
        await createPost.mutateAsync({ data: values });
        toast.success("Post created");
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        setLocation("/admin/posts");
      } else {
        await updatePost.mutateAsync({ id: id!, data: values });
        toast.success("Post updated");
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(id!) });
        setLocation("/admin/posts");
      }
    } catch {
      toast.error("Failed to save post");
    }
  };

  if (!isNew && isLoading) {
    return <AdminLayout><div className="p-8 text-center text-muted-foreground">Loading editor...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{isNew ? "New Post" : "Edit Post"}</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your post content here in Markdown..." 
                          className="min-h-[500px] font-mono" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-card border rounded-xl space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Published</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === "published"}
                            onCheckedChange={(checked) => field.onChange(checked ? "published" : "draft")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="auto-generated-if-empty" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Featured Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief summary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm">SEO Settings</h3>
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Custom SEO title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Meta description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => setLocation("/admin/posts")}>Cancel</Button>
                  <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
                    {createPost.isPending || updatePost.isPending ? "Saving..." : "Save Post"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}

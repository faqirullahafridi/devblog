import { AdminLayout } from "@/components/layout/admin-layout";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();
  const queryClient = useQueryClient();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<{id: number, name: string, description: string, slug: string} | null>(null);
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await createCategory.mutateAsync({ data: { name: newCatName, description: newCatDesc } });
      toast.success("Category created");
      setIsCreateOpen(false);
      setNewCatName("");
      setNewCatDesc("");
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      await updateCategory.mutateAsync({ 
        id: editCategory.id, 
        data: { name: editCategory.name, description: editCategory.description, slug: editCategory.slug } 
      });
      toast.success("Category updated");
      setEditCategory(null);
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteCategory.mutateAsync({ id });
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>New Category</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCategory.isPending}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : categories?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No categories</TableCell>
                </TableRow>
              ) : (
                categories?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                    <TableCell>{cat.postCount}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditCategory({
                        id: cat.id, name: cat.name, description: cat.description || "", slug: cat.slug
                      })}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={editCategory?.name || ""} 
                  onChange={(e) => setEditCategory(prev => prev ? {...prev, name: e.target.value} : null)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={editCategory?.slug || ""} 
                  onChange={(e) => setEditCategory(prev => prev ? {...prev, slug: e.target.value} : null)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={editCategory?.description || ""} 
                  onChange={(e) => setEditCategory(prev => prev ? {...prev, description: e.target.value} : null)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateCategory.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

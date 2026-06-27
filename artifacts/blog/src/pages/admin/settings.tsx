import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useChangeAdminPassword,
  useChangeAdminUsername,
  useGetAuthMe,
  getGetAuthMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@workspace/api-client-react";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const data = err.data as { error?: string } | null;
    if (data?.error) return data.error;
    if (err.status === 401) return "Your session expired. Please sign in again.";
  }
  return fallback;
}

export default function AdminSettings() {
  const { data: auth } = useGetAuthMe();
  const queryClient = useQueryClient();
  const changePassword = useChangeAdminPassword();
  const changeUsername = useChangeAdminUsername();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernamePassword, setUsernamePassword] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePassword.mutateAsync({
        data: { currentPassword, newPassword },
      });
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change password. Check your current password."));
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    try {
      const res = await changeUsername.mutateAsync({
        data: { currentPassword: usernamePassword, newUsername: newUsername.trim() },
      });
      queryClient.setQueryData(getGetAuthMeQueryKey(), {
        authenticated: true,
        username: res.username,
      });
      toast.success("Username updated");
      setUsernamePassword("");
      setNewUsername("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change username. Check your current password."));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your admin account. Signed in as <strong>{auth?.username}</strong>.
          </p>
        </div>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Change username</h2>
          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">New username</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={auth?.username ?? "admin"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username-password">Current password</Label>
              <Input
                id="username-password"
                type="password"
                value={usernamePassword}
                onChange={(e) => setUsernamePassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={changeUsername.isPending}>
              {changeUsername.isPending ? "Saving..." : "Update username"}
            </Button>
          </form>
        </section>

        <section className="border rounded-xl p-6 bg-card space-y-4">
          <h2 className="text-lg font-semibold">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Saving..." : "Update password"}
            </Button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}

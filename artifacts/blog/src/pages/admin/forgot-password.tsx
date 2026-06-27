import { useForgotAdminPassword } from "@workspace/api-client-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const forgotPassword = useForgotAdminPassword();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await forgotPassword.mutateAsync({
        data: { username, recoveryToken, newPassword },
      });
      toast.success("Password reset successfully. You can sign in now.");
      setLocation("/admin/login");
    } catch {
      toast.error("Failed to reset password. Check your username and recovery token.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <BrandLogo variant="admin" markClassName="h-11 w-11" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Use your recovery token to set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recovery-token">Recovery token</Label>
            <Input
              id="recovery-token"
              type="password"
              value={recoveryToken}
              onChange={(e) => setRecoveryToken(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Set via the <code className="text-xs">ADMIN_RECOVERY_TOKEN</code> environment variable on your server.
            </p>
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
          <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
            {forgotPassword.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/admin/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

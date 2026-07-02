import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { requestPasswordResetOtp, resetPasswordWithOtp } from "@/lib/api-extra";

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(username.trim());
      toast.success(res.message ?? "If that account exists, a reset code was sent.");
      setStep("reset");
      setOtp("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithOtp(username.trim(), otp, newPassword);
      toast.success("Password reset successfully. You can sign in now.");
      setLocation("/admin/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <BrandLogo variant="admin" markClassName="h-11 w-11" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === "request" ? "Forgot password" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "request"
              ? "Enter your admin username. We'll email a reset code to the admin address on file."
              : "Enter the code from your email and choose a new password."}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending code..." : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username-readonly">Username</Label>
              <Input id="username-readonly" value={username} readOnly />
            </div>
            <div className="space-y-3">
              <Label htmlFor="reset-otp">Reset code</Label>
              <div className="flex justify-center">
                <InputOTP id="reset-otp" maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
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
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("request")}>
              Request a new code
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/admin/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

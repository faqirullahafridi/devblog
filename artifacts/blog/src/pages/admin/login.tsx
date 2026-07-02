import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { SITE_NAME } from "@/lib/site-config";
import { requestAdminLogin, verifyAdminOtp } from "@/lib/api-extra";

export default function AdminLogin() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingUsername, setPendingUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestAdminLogin(username, password);
      if (res.otpRequired) {
        setPendingUsername(res.username ?? username);
        setStep("otp");
        setOtp("");
        toast.success(res.message ?? "Verification code sent to your admin email.");
        return;
      }
      if (res.authenticated) {
        toast.success("Welcome back!");
        queryClient.setQueryData(getGetAuthMeQueryKey(), res);
        setLocation("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyAdminOtp(pendingUsername, otp);
      if (res.authenticated) {
        toast.success("Welcome back!");
        queryClient.setQueryData(getGetAuthMeQueryKey(), res);
        setLocation("/admin/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid verification code.");
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
            {step === "credentials" ? "Admin Login" : "Enter verification code"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "credentials"
              ? `Sign in to manage ${SITE_NAME}.`
              : `We sent a 6-digit code to your admin email for ${pendingUsername}.`}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending code..." : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="otp">One-time code</Label>
              <div className="flex justify-center">
                <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp}>
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
              <p className="text-xs text-center text-muted-foreground">Code expires in 10 minutes.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify & sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("credentials");
                setOtp("");
              }}
            >
              Back to username & password
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/admin/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

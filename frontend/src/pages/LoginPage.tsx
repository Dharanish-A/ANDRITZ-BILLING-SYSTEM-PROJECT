import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import * as authService from "../services/auth";
import { useToast } from "../components/ui/Toast";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { signIn, setSessionUser } = useAuth();
  const { notify } = useToast();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (otpMode) {
        const session = await authService.verifyOtp(email, otp);
        setSessionUser(session.user);
      } else {
        await signIn(email, password);
      }
      navigate("/");
    } catch (error) {
      const err = error as any;
      // Extract the first specific field error if available (e.g., "Invalid email")
      const fieldErrors = err.errors?.fieldErrors;
      const firstDetail = fieldErrors ? Object.values(fieldErrors).flat()[0] : null;
      
      const errorMessage = firstDetail 
        ? `Validation Error: ${firstDetail}` 
        : (error instanceof Error ? error.message : "Login failed");

      notify(String(errorMessage), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-andritz-light dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-andritz-dark px-6 py-8 text-white sm:px-12">
          <div className="text-3xl font-bold tracking-tight">ANDRITZ</div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-sm text-sky-100">
              <ShieldCheck size={16} />
              Enterprise-grade travel governance
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Travel Expense & Billing Management System</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-sky-100">
              Submit trips, capture receipts, automate bill extraction, and route expenses through manager and finance approval.
            </p>
          </motion.div>
          <div className="text-sm text-sky-100">India rollout ready, global expansion aligned.</div>
        </section>

        <section className="flex items-center justify-center px-4 py-10">
          <Card className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Secure sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Use company credentials or email OTP verification.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Company Email</Label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              {otpMode ? (
                <div>
                  <Label>One-time Password</Label>
                  <Input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" maxLength={6} required />
                </div>
              ) : (
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
              )}
              <Button className="w-full" disabled={busy}>
                {otpMode ? "Verify OTP" : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                className="font-semibold text-andritz-blue"
                onClick={async () => {
                  setOtpMode(true);
                  await authService.sendOtp(email);
                  notify("OTP sent to email");
                }}
              >
                Use OTP
              </button>
              <button className="text-slate-500">Forgot password?</button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

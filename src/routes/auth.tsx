import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import mark from "@/assets/aurum-mark.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Aurum" },
      { name: "description", content: "Sign in to Aurum to continue your private conversation." },
      { property: "og:title", content: "Sign in — Aurum" },
      { property: "og:description", content: "Continue your private conversation with Aurum." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/chat", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/chat" } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your inbox to confirm your email.");
    }
    setBusy(false);
  }

  async function oauth(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg(r.error.message ?? "Sign-in failed");
  }

  return (
    <div className="grain relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gold-soft blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <Link to="/" className="mb-10 flex items-center justify-center gap-3">
          <img src={mark} alt="" width={40} height={40} className="h-10 w-10" />
          <span className="font-display text-3xl">Aurum</span>
        </Link>
        <h1 className="mb-2 text-center font-display text-5xl">{mode === "in" ? "Welcome back." : "Begin here."}</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Your conversation is kept privately in your account.</p>

        <div className="space-y-3">
          <button type="button" onClick={() => oauth("google")} className="flex h-12 w-full items-center justify-center rounded-full border border-border text-sm transition-colors hover:border-gold/60">
            Continue with Google
          </button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>
            Continue with Lovable
          </button>
        </div>

        <div className="my-6 flex items-center gap-4"><div className="h-px flex-1 bg-border" /><span className="eyebrow">or</span><div className="h-px flex-1 bg-border" /></div>

        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-12 w-full rounded-full border border-input bg-transparent px-5 text-sm outline-none transition-colors focus:border-gold" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full rounded-full border border-input bg-transparent px-5 text-sm outline-none transition-colors focus:border-gold" />
          <button disabled={busy} className="h-12 w-full rounded-full bg-gold-gradient text-sm font-medium text-primary-foreground shadow-gold transition-opacity disabled:opacity-60">
            {busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
          </button>
        </form>
        {msg && <p className="mt-4 text-center text-sm text-gold">{msg}</p>}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "in" ? "New to Aurum?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-foreground underline-offset-4 hover:underline">
            {mode === "in" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

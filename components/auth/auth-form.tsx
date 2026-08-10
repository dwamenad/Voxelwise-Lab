"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, GitBranch, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/config";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    if (isDemoMode) {
      router.push("/dashboard");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const result = mode === "login"
      ? await supabase!.auth.signInWithPassword({ email, password })
      : await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then return to sign in.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function githubLogin() {
    if (isDemoMode) { router.push("/dashboard"); return; }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase!.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (error) { setMessage(error.message); setLoading(false); }
  }

  return <form className="auth-form" onSubmit={submit}>
    <button className="oauth-button" type="button" onClick={githubLogin} disabled={loading}><GitBranch size={19} />Continue with GitHub</button>
    <div className="auth-divider"><span>or use email</span></div>
    <label>Email address<input required type="email" name="email" autoComplete="email" placeholder="you@university.edu" defaultValue={isDemoMode ? "maya.demo@fsl.academy" : ""} /></label>
    <label>Password<input required minLength={8} type="password" name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" defaultValue={isDemoMode ? "demomode" : ""} /></label>
    {message && <p className="auth-message" role="status">{message}</p>}
    <button className="button button--acid auth-submit" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={18} /></>}</button>
    <p>{mode === "login" ? <>New to FSL Academy? <Link href="/signup">Create an account</Link></> : <>Already have an account? <Link href="/login">Sign in</Link></>}</p>
  </form>;
}

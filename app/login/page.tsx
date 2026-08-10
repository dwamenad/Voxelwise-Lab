import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { isDemoMode } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };
export default function LoginPage() { return <main className="auth-page"><section className="auth-page__context"><Link href="/">FSL Academy</Link><div><span className="eyebrow">Student account</span><h1>Return to your analysis.</h1><p>Your course progress, completed lessons, and last workspace are kept together.</p></div><p>Independent education for careful fMRI practice.</p></section><section className="auth-page__panel"><div><span className="eyebrow">Welcome back</span><h2>Sign in</h2>{isDemoMode && <p className="demo-notice">Demo mode is active. Use the prefilled details or GitHub button to enter the local student dashboard.</p>}<AuthForm mode="login" /></div></section></main>; }


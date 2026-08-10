import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { isDemoMode } from "@/lib/config";

export const metadata: Metadata = { title: "Create account" };
export default function SignupPage() { return <main className="auth-page"><section className="auth-page__context"><Link href="/">FSL Academy</Link><div><span className="eyebrow">Self-paced learning</span><h1>Build a careful FSL practice.</h1><p>Enroll in a course, work alongside Neurodesk, and mark progress when the practical step is complete.</p></div><p>No points, streaks, or public profile.</p></section><section className="auth-page__panel"><div><span className="eyebrow">Student account</span><h2>Create your account</h2>{isDemoMode && <p className="demo-notice">Demo mode is active. This form opens the local student experience without creating an external account.</p>}<AuthForm mode="signup" /></div></section></main>; }


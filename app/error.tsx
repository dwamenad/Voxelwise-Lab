"use client";

import { RotateCcw } from "lucide-react";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="state-page"><span>Unable to load</span><h1>The learning workspace hit an unexpected error.</h1><p>Your local progress remains stored in this browser. Try loading the page again.</p><button className="button button--dark" type="button" onClick={reset}><RotateCcw />Try again</button></main>; }

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() { return <main className="state-page"><span>404</span><h1>This analysis path does not exist.</h1><p>The course or lesson may have moved. Search the curriculum or return to the course catalog.</p><div><Link className="button button--dark" href="/courses"><ArrowLeft />Course catalog</Link><Link className="button button--outline" href="/search"><Search />Search</Link></div></main>; }


import Link from "next/link";
import { Search } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

const navigation = [
  { href: "/courses", label: "Courses" },
  { href: "/resources", label: "Resources" },
  { href: "/glossary", label: "Glossary" },
  { href: "/troubleshooting", label: "Help" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-link" aria-label="FSL Academy home">
          <BrandMark className="h-8 w-8 text-[var(--ink)]" />
          <span>FSL Academy</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="header-actions">
          <span className="privacy-badge">No account needed</span>
          <form action="/search" className="header-search" role="search">
            <Search size={16} aria-hidden="true" />
            <input name="q" aria-label="Search courses, lessons, and help" placeholder="Search" />
          </form>
          <Link href="/dashboard" className="text-link header-dashboard">My progress</Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <div className="mobile-menu__panel">
              {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
              <Link href="/dashboard">My progress</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Link href="/" className="brand-link brand-link--light">
            <BrandMark className="h-8 w-8 text-[var(--acid)]" />
            <span>FSL Academy</span>
          </Link>
          <p>Independent, self-paced learning for careful fMRI analysis.</p>
        </div>
        <div className="footer-links">
          <div><span>Learn</span><Link href="/courses">Courses</Link><Link href="/dashboard">Dashboard</Link><Link href="/resources">Resources</Link></div>
          <div><span>Reference</span><Link href="/glossary">Glossary</Link><Link href="/troubleshooting">Troubleshooting</Link><Link href="/about">About</Link></div>
        </div>
      </div>
      <div className="site-footer__bottom">
        <p>Educational content only. Follow your institutional and project-specific analysis protocols.</p>
        <p>Curriculum adapted from TUBRIC’s 2026s-fmri-class under MIT license.</p>
      </div>
    </footer>
  );
}


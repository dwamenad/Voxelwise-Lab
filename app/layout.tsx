import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConditionalChrome } from "@/components/conditional-chrome";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FSL Academy", template: "%s · FSL Academy" },
  description: "Learn fMRI analysis through clear concepts and guided FSL practice in Neurodesk.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ProgressProvider>
          <ConditionalChrome><SiteHeader /></ConditionalChrome>
          {children}
          <ConditionalChrome><SiteFooter /></ConditionalChrome>
        </ProgressProvider>
      </body>
    </html>
  );
}

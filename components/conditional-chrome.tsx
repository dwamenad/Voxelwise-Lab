"use client";

import { usePathname } from "next/navigation";

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.includes("/lessons/")) return null;
  return children;
}


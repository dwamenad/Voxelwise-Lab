export function requiresAuthentication(pathname: string, demoMode: boolean): boolean {
  return pathname.startsWith("/dashboard") && !demoMode;
}


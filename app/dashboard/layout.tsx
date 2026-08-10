import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requiresAuthentication } from "@/lib/auth/protection";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (requiresAuthentication("/dashboard", isDemoMode)) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase!.auth.getUser();
    if (!data.user) redirect("/login?next=/dashboard");
  }
  return children;
}

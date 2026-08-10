export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !hasSupabaseConfig;

export const demoStudent = {
  id: "demo-student",
  displayName: "Maya Chen",
  email: "maya.demo@fsl.academy",
};


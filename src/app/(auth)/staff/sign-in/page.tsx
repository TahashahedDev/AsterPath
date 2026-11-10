import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/auth-form";
import { safeNextPath } from "@/features/auth/schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Team sign-in" };

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <AuthForm mode="staff" available={isSupabaseConfigured()} next={next ? safeNextPath(next, "/admin") : undefined} notice={error} />;
}

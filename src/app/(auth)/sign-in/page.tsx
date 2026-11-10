import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/auth-form";
import { safeNextPath } from "@/features/auth/schema";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <AuthForm mode="sign-in" available={isSupabaseConfigured()} next={next ? safeNextPath(next) : undefined} notice={error} />;
}

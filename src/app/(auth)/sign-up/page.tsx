import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthForm } from "@/components/forms/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage() {
  await connection();
  return <AuthForm mode="sign-up" available={isSupabaseConfigured()} />;
}

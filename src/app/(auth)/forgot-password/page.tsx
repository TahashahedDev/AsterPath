import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/password-forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm available={isSupabaseConfigured()} />;
}

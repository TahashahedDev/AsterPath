// Creates (or repairs) the AsterPath owner account in Supabase, run once by the
// founder from their own machine:  npm run admin:create
//
// Asks for name, username, email and password in the terminal. The password is
// typed hidden, sent straight to Supabase Auth (which stores only a bcrypt hash)
// and never written to disk, the code or the logs. Needs NEXT_PUBLIC_SUPABASE_URL
// and SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let hidden = false;
// Hide typed characters while a password is being entered.
rl._writeToOutput = (s) => {
  if (!hidden) rl.output.write(s);
};
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
async function askHidden(q) {
  process.stdout.write(q);
  hidden = true;
  const answer = await ask("");
  hidden = false;
  process.stdout.write("\n");
  return answer;
}

function passwordProblem(password, username, email) {
  const lower = password.toLowerCase();
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 72) return "Use 72 characters or fewer.";
  if (lower.includes(username.toLowerCase()) || lower.includes(email.split("@")[0].toLowerCase())) return "Don't include your username or email in the password.";
  if (/asterpath|password|qwerty|123456/.test(lower)) return "Avoid common words and sequences.";
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  if (kinds < 3) return "Mix at least three of: lowercase, uppercase, numbers, symbols.";
  return null;
}

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

try {
  console.log("AsterPath owner account setup\n");
  const fullName = await ask("Full name: ");
  const username = await ask("Username (3–32 letters, numbers, . _ -): ");
  if (!/^[A-Za-z0-9._-]{3,32}$/.test(username)) throw new Error("That username isn't allowed.");
  const email = (await ask("Email (for password resets): ")).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("That email doesn't look right.");

  // Find an existing account with this email (small team, one page is enough).
  const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`Couldn't reach Supabase Auth (${listError.code ?? listError.status}).`);
  const existing = list.users.find((u) => u.email?.toLowerCase() === email);

  // Only one owner: refuse if a different account already holds the role.
  const { data: owners } = await db.from("team_members").select("user_id").eq("role", "owner");
  if ((owners ?? []).some((o) => o.user_id !== existing?.id)) throw new Error("A different account is already the owner. Change roles from Admin → Team instead.");

  let password = "";
  if (!existing || (await ask("That email already has an account. Set a new password? (y/N): ")).toLowerCase() === "y") {
    password = await askHidden("Password: ");
    const problem = passwordProblem(password, username, email);
    if (problem) throw new Error(problem);
    if ((await askHidden("Type it again: ")) !== password) throw new Error("The two passwords don't match.");
  }

  let userId = existing?.id;
  if (!existing) {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
    if (error) throw new Error(error.code === "weak_password" ? "Supabase rejected the password as weak." : `Couldn't create the account (${error.code ?? error.status}).`);
    userId = data.user.id;
  } else if (password) {
    const { error } = await db.auth.admin.updateUserById(existing.id, { password });
    if (error) throw new Error(`Couldn't update the password (${error.code ?? error.status}).`);
  }

  const { error: memberError } = await db.from("team_members").upsert({ user_id: userId, role: "owner", active: true, username }, { onConflict: "user_id" });
  if (memberError) throw new Error(memberError.code === "23505" ? "That username is taken." : `Couldn't save the team role (${memberError.code}).`);

  console.log(`\nDone. Sign in at /staff/sign-in with "${username}" (or ${email}).`);
  console.log("On first sign-in you'll scan a QR code with an authenticator app (Google Authenticator, 1Password, Authy).");
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : "Setup failed."}`);
  process.exitCode = 1;
} finally {
  rl.close();
}

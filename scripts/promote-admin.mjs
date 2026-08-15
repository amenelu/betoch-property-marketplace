import { createClient } from "@supabase/supabase-js";
const email = process.argv[2]?.trim().toLowerCase(),
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email) throw new Error("Usage: npm run promote-admin -- you@example.com");
if (!url || !key)
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
const db = createClient(url, key, { auth: { persistSession: false } });
let page = 1,
  user;
while (!user) {
  const { data, error } = await db.auth.admin.listUsers({
    page,
    perPage: 1000,
  });
  if (error) throw error;
  user = data.users.find((x) => x.email?.toLowerCase() === email);
  if (user || data.users.length < 1000) break;
  page++;
}
if (!user)
  throw new Error(
    "Register and confirm this email in Betoch before promoting it",
  );
const { error } = await db
  .from("profiles")
  .update({ role: "admin", updated_at: new Date().toISOString() })
  .eq("id", user.id);
if (error) throw error;
console.log(`Promoted ${email} to administrator.`);

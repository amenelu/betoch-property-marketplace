"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "@/components/icons";
import { DemoRole, useDemo } from "@/components/demo-provider";
export default function Register() {
  const { signUp } = useDemo();
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false);
  if (sent)
    return (
      <Shell>
        <h1 className="mt-7 font-serif text-3xl text-[#173c34]">
          Check your email
        </h1>
        <p className="mt-3 text-stone-600">
          Open the confirmation link from Supabase, then sign in to Betoch.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-bold text-[#d85d3f]"
        >
          Go to sign in
        </Link>
      </Shell>
    );
  return (
    <Shell>
      <h1 className="mt-7 font-serif text-3xl font-semibold text-[#173c34]">
        Create your Betoch account
      </h1>
      <p className="mt-2 text-sm text-stone-500">
        Save properties, contact sellers, or publish listings.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const d = new FormData(e.currentTarget);
          const role = String(d.get("role")) as Exclude<DemoRole, "admin">;
          try {
            const result = await signUp(
              String(d.get("name")),
              String(d.get("email")),
              String(d.get("password")),
              role,
            );
            if (result.confirmed)
              router.push(role === "buyer" ? "/favorites" : "/dashboard");
            else setSent(true);
          } catch (x) {
            setError(x instanceof Error ? x.message : "Unable to register");
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field name="name" label="Full name" type="text" />
        <Field name="email" label="Email" type="email" />
        <Field name="password" label="Password" type="password" />
        <label className="block text-sm font-semibold">
          I am joining as
          <select
            name="role"
            className="mt-2 h-12 w-full rounded-xl border px-3 font-normal"
          >
            <option value="buyer">Buyer / renter</option>
            <option value="owner">Property owner</option>
            <option value="broker">Broker / agent</option>
          </select>
        </label>
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
        <button
          disabled={busy}
          className="h-12 w-full rounded-xl bg-[#d85d3f] font-bold text-white disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-[#d85d3f]">
          Sign in
        </Link>
      </p>
    </Shell>
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#173c34] p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold text-[#173c34]"
        >
          <Building2 />
          Betoch
        </Link>
        {children}
      </section>
    </main>
  );
}
function Field({
  name,
  label,
  type,
}: {
  name: string;
  label: string;
  type: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        required
        name={name}
        type={type}
        minLength={type === "password" ? 8 : undefined}
        autoComplete={type === "password" ? "new-password" : type}
        className="mt-2 h-12 w-full rounded-xl border px-3 font-normal"
      />
    </label>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "@/components/icons";
import { useDemo } from "@/components/demo-provider";
export default function Login() {
  const { signIn } = useDemo();
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-[#173c34] p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold text-[#173c34]"
        >
          <Building2 />
          Betoch
        </Link>
        <h1 className="mt-8 font-serif text-3xl font-semibold text-[#173c34]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Sign in to save homes, contact sellers, or manage listings.
        </p>
        <form
          className="mt-7 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const d = new FormData(e.currentTarget);
            try {
              const role = await signIn(
                String(d.get("email")),
                String(d.get("password")),
              );
              router.push(
                role === "admin"
                  ? "/admin"
                  : role === "buyer"
                    ? "/favorites"
                    : "/dashboard",
              );
            } catch (x) {
              setError(x instanceof Error ? x.message : "Unable to sign in");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm font-semibold">
            Email
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="mt-2 h-12 w-full rounded-xl border px-4 font-normal"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              required
              name="password"
              type="password"
              minLength={8}
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-xl border px-4 font-normal"
            />
          </label>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#173c34]"
            >
              Forgot password?
            </Link>
          </div>
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
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          New to Betoch?{" "}
          <Link href="/register" className="font-bold text-[#d85d3f]">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { Building2, Check } from "@/components/icons";
import { useDemo } from "@/components/demo-provider";
export default function ForgotPassword() {
  const { resetPassword } = useDemo();
  const [sent, setSent] = useState(false),
    [error, setError] = useState("");
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
        {sent ? (
          <div className="py-12 text-center">
            <Check className="mx-auto text-emerald-700" size={36} />
            <h1 className="mt-4 font-serif text-3xl text-[#173c34]">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              If an account exists, Supabase sent a reset link.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-8 font-serif text-3xl text-[#173c34]">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Enter the email used for your Betoch account.
            </p>
            <form
              className="mt-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                const email = String(
                  new FormData(e.currentTarget).get("email"),
                );
                try {
                  await resetPassword(email);
                  setSent(true);
                } catch (x) {
                  setError(
                    x instanceof Error
                      ? x.message
                      : "Unable to send reset link",
                  );
                }
              }}
            >
              <label className="text-sm font-semibold">
                Email
                <input
                  name="email"
                  required
                  type="email"
                  className="mt-2 h-12 w-full rounded-xl border px-3 font-normal"
                />
              </label>
              {error ? (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <button className="mt-4 h-12 w-full rounded-xl bg-[#d85d3f] font-bold text-white">
                Send reset link
              </button>
            </form>
          </>
        )}
        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-bold text-[#173c34]"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

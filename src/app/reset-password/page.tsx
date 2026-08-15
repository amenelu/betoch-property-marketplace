"use client";
import { useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase";
export default function ResetPassword() {
  const [done, setDone] = useState(false),
    [error, setError] = useState("");
  return (
    <main className="grid min-h-screen place-items-center bg-[#173c34] p-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-8">
        <h1 className="font-serif text-3xl text-[#173c34]">
          Choose a new password
        </h1>
        {done ? (
          <>
            <p className="mt-4 text-emerald-700">
              Your password has been updated.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block font-bold text-[#d85d3f]"
            >
              Sign in
            </Link>
          </>
        ) : (
          <form
            className="mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const password = String(
                new FormData(e.currentTarget).get("password"),
              );
              const { error } = await getBrowserClient()!.auth.updateUser({
                password,
              });
              if (error) setError(error.message);
              else setDone(true);
            }}
          >
            <label className="text-sm font-semibold">
              New password
              <input
                name="password"
                type="password"
                minLength={8}
                required
                className="mt-2 h-12 w-full rounded-xl border px-3"
              />
            </label>
            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button className="mt-4 h-12 w-full rounded-xl bg-[#d85d3f] font-bold text-white">
              Update password
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

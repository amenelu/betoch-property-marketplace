"use client";
import Link from "next/link";
import { AdminWorkspace } from "@/components/admin-workspace";
import { useDemo } from "@/components/demo-provider";
import { ShieldCheck } from "@/components/icons";
export default function Admin() {
  const { ready, user } = useDemo();
  if (!ready) return <Loading />;
  if (user?.role !== "admin")
    return (
      <Gate
        title="Administrator access required"
        text="Sign in with an authorized administrator account to review users, listings, verification and reports."
      />
    );
  return <AdminWorkspace />;
}
function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f4ee] text-stone-500">
      Loading workspace…
    </main>
  );
}
function Gate({ title, text }: { title: string; text: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#173c34] p-5">
      <section className="max-w-md rounded-3xl bg-white p-8 text-center">
        <ShieldCheck className="mx-auto text-[#287864]" size={38} />
        <h1 className="mt-4 font-serif text-3xl text-[#173c34]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">{text}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[#d85d3f] px-6 py-3 font-bold text-white"
        >
          Sign in
        </Link>
      </section>
    </main>
  );
}

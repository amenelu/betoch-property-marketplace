"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PropertyCard } from "@/components/property-card";
import { useDemo } from "@/components/demo-provider";
import type { Property } from "@/lib/types";
import Link from "next/link";
export default function Favorites() {
  const { favorites } = useDemo();
  const [properties, setProperties] = useState<Property[]>([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((x) => setProperties(x.data || []))
      .finally(() => setLoading(false));
  }, []);
  const saved = properties.filter((p) => favorites.includes(p.id));
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[65vh] max-w-7xl px-5 py-12 lg:px-8">
        <p className="eyebrow">Your shortlist</p>
        <h1 className="section-title">My favorites</h1>
        <p className="mt-3 text-stone-500">
          Compare the properties you want to revisit.
        </p>
        {loading ? (
          <p className="mt-10 text-stone-500">Loading saved properties…</p>
        ) : saved.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {saved.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 py-20 text-center">
            <p className="font-serif text-2xl text-[#173c34]">
              No saved properties yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Use the heart on any property to add it here.
            </p>
            <Link
              href="/properties"
              className="mt-6 inline-flex rounded-full bg-[#d85d3f] px-6 py-3 text-sm font-bold text-white"
            >
              Explore properties
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

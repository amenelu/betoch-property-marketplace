"use client";
import { useMemo, useState } from "react";
import type { Property } from "@/lib/types";
import { PropertyCard } from "./property-card";
import { ExternalSearchLinks } from "./external-search-links";
import { MapPin, Search, SlidersHorizontal } from "./icons";

export function SearchExperience({ initial, params }: { initial: Property[]; params: Record<string, string | undefined> }) {
  const [query, setQuery] = useState(params.location || "");
  const [type, setType] = useState(params.listingType || "");
  const [propertyType, setPropertyType] = useState(params.propertyType || "");
  const [inventory, setInventory] = useState(params.inventory || "all");
  const [minBeds, setMinBeds] = useState(0);
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState("newest");
  const [map, setMap] = useState(false);
  const results = useMemo(() => {
    const filtered = initial.filter((p) =>
      (!query || `${p.title} ${p.neighborhood} ${p.subcity}`.toLowerCase().includes(query.toLowerCase())) &&
      (!type || p.listingType === type) && (!propertyType || p.propertyType.toLowerCase() === propertyType.toLowerCase()) &&
      (inventory === "all" || p.inventoryType === inventory) && p.bedrooms >= minBeds &&
      (!verified || p.verificationStatus !== "unverified"));
    return [...filtered].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "area" ? b.areaSqm - a.areaSqm : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [initial, query, type, propertyType, inventory, minBeds, verified, sort]);
  const clear = () => { setQuery(""); setType(""); setPropertyType(""); setInventory("all"); setMinBeds(0); setVerified(false); };
  return <>
    <div className="border-y border-stone-200 bg-white"><div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
      <label className="flex h-12 items-center gap-2 rounded-xl border border-stone-300 px-3"><span className="sr-only">Location or keyword</span><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location or keyword" className="w-full outline-none" /></label>
      <Select label="Listing type" value={type} onChange={setType}><option value="">Buy, rent or stay</option><option value="sale">For sale</option><option value="rent">For rent</option><option value="short_term_stay">Short stay</option></Select>
      <Select label="Property type" value={propertyType} onChange={setPropertyType}><option value="">Property type</option>{["Apartment", "House", "Villa", "Office", "Condominium", "Land", "Commercial", "Warehouse"].map((x) => <option key={x}>{x}</option>)}</Select>
      <Select label="Listing source" value={inventory} onChange={setInventory}><option value="all">All listings</option><option value="direct">Direct listings</option><option value="aggregated">Aggregated listings</option></Select>
      <Select label="Minimum bedrooms" value={String(minBeds)} onChange={(x) => setMinBeds(Number(x))}><option value="0">Any beds</option><option value="1">1+ beds</option><option value="2">2+ beds</option><option value="3">3+ beds</option><option value="4">4+ beds</option></Select>
      <label className="flex h-12 items-center gap-2 rounded-xl border border-stone-300 px-3 text-sm"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 accent-[#183c34]" />Verified direct listings only</label>
    </div></div>
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Addis Ababa</p><h1 className="font-serif text-3xl font-semibold text-[#183c34]">Properties to call home</h1><p className="mt-2 text-sm text-stone-500" aria-live="polite">{results.length} properties found</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setMap(!map)} aria-pressed={map} className="flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold"><MapPin size={16} />{map ? "List view" : "Map view"}</button><label className="flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4"><SlidersHorizontal size={16} /><span className="sr-only">Sort results</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent py-2 text-sm outline-none"><option value="newest">Recently checked</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="area">Largest area</option></select></label></div></div>
      {map ? <div className="relative h-[65vh] min-h-[420px] overflow-hidden rounded-2xl bg-[#dce5dc] bg-[radial-gradient(circle_at_20%_40%,#fff_0,transparent_30%),radial-gradient(circle_at_70%_60%,#c5d4c5_0,transparent_35%)]" aria-label="Approximate property map"><div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(35deg,transparent 45%,#779688 46%,#779688 48%,transparent 49%),linear-gradient(125deg,transparent 45%,#fff 46%,#fff 48%,transparent 49%)", backgroundSize: "120px 100px" }} />{results.map((p, i) => <button type="button" aria-label={`${p.title}, ${Math.round(p.price / 1000000)} million ETB`} key={p.id} className="absolute min-h-10 rounded-full bg-[#183c34] px-3 text-xs font-bold text-white shadow-lg" style={{ left: `${15 + (i * 17) % 70}%`, top: `${18 + (i * 23) % 65}%` }}>{p.price ? `${Math.round(p.price / 1000000)}M` : "View"}</button>)}<p className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-4 py-2 text-xs text-stone-600 sm:inset-x-auto sm:left-4">Approximate locations shown for privacy</p></div> : results.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.map((p) => <PropertyCard key={p.id} property={p} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 py-20 text-center"><p className="font-serif text-2xl text-[#183c34]">No homes match those filters</p><button type="button" onClick={clear} className="mt-4 min-h-11 px-4 text-sm font-bold text-[#d85d3f]">Clear all filters</button></div>}
      <ExternalSearchLinks filters={{ location: query, listingType: type, propertyType, minBeds }} />
    </div>
  </>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label><span className="sr-only">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-xl border border-stone-300 px-3">{children}</select></label>;
}

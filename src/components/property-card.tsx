"use client";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { Bath, BedDouble, Heart, MapPin, Maximize, ShieldCheck } from "./icons";
import { useDemo } from "./demo-provider";

const modeLabel: Record<string, string> = { sale: "For sale", rent: "For rent", long_term_rent: "Long-term rent", medium_term_rent: "Medium-term rent", short_term_stay: "Short stay" };

export function PropertyCard({ property }: { property: Property }) {
  const { favorites, toggleFavorite } = useDemo();
  const saved = favorites.includes(property.id);
  const aggregated = property.inventoryType === "aggregated";
  const suffix = property.listingType === "short_term_stay" ? "night" : property.listingType === "medium_term_rent" ? "week" : property.listingType !== "sale" ? "month" : null;
  return <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(31,48,43,.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(31,48,43,.1)] focus-within:ring-2 focus-within:ring-[#287864] focus-within:ring-offset-2">
    <Link href={`/properties/${property.slug}`} aria-label={`View ${property.title}`} className="absolute inset-0 z-10 rounded-2xl"><span className="sr-only">View {property.title}</span></Link>
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image src={property.image} alt={property.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#183c34]">{modeLabel[property.listingType]}</span>
      {aggregated ? <span className="absolute bottom-4 left-4 rounded-full bg-[#173c34]/95 px-3 py-1.5 text-[11px] font-bold text-white">From {property.source?.name}</span> : <button type="button" onClick={() => toggleFavorite(property.id)} aria-label={saved ? "Remove favorite" : "Save favorite"} aria-pressed={saved} className="tap-target absolute right-4 top-4 z-20 grid place-items-center rounded-full bg-white/95 shadow"><Heart size={19} className={saved ? "fill-[#d85d3f] text-[#d85d3f]" : "text-stone-600"} /></button>}
    </div>
    <div className="p-5">
      <div className="mb-2 flex items-center justify-between gap-2"><p className="text-xl font-bold text-[#173c34]">{property.price ? formatPrice(property.price) : "Price unavailable"}{suffix && property.price ? <span className="text-xs font-medium text-stone-500"> / {suffix}</span> : null}</p>{property.verificationStatus !== "unverified" ? <span title="Verification checks available"><ShieldCheck size={20} className="shrink-0 text-[#287864]" /></span> : null}</div>
      <h3 className="font-serif text-lg font-semibold text-stone-900 group-hover:text-[#b94730]">{property.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-stone-500"><MapPin size={14} />{property.neighborhood}, {property.city}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-100 pt-4 text-xs font-medium text-stone-600">{property.bedrooms > 0 ? <span className="flex items-center gap-1.5"><BedDouble size={16} />{property.bedrooms} beds</span> : null}{property.bathrooms > 0 ? <span className="flex items-center gap-1.5"><Bath size={16} />{property.bathrooms} baths</span> : null}{property.areaSqm > 0 ? <span className="flex items-center gap-1.5"><Maximize size={16} />{property.areaSqm} m²</span> : null}</div>
    </div>
  </article>;
}

"use client";
import { ExternalLink, Search } from "./icons";
import { buildExternalSearchLinks, type ExternalSearchFilters } from "@/lib/external-search";

export function ExternalSearchLinks({ filters }: { filters: ExternalSearchFilters }) {
  const links = buildExternalSearchLinks(filters);
  function track(source: string) {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ event_type: "search", metadata: { action: "external_search_click", source, filters } }),
    }).catch(() => undefined);
  }
  return <section className="mt-12 border-t border-stone-200 pt-10" aria-labelledby="external-search-heading">
    <div className="max-w-3xl">
      <p className="eyebrow">Search beyond Betoch</p>
      <h2 id="external-search-heading" className="mt-2 font-serif text-3xl font-semibold text-[#183c34]">Continue this search on other property sites</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">These are external search links, not listings imported into Betoch. Each source opens in a new tab and may interpret keywords differently.</p>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => <article key={link.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgba(31,48,43,.04)]">
        <div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-[#eeeae0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#183c34]">{link.relationship}</span><h3 className="mt-3 font-serif text-xl font-semibold text-[#183c34]">{link.name}</h3></div><Search size={20} className="text-[#d85d3f]" /></div>
        <p className="mt-3 flex-1 text-xs leading-5 text-stone-500">{link.note}</p>
        <dl className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-xs"><div><dt className="font-bold text-stone-700">Transferred</dt><dd className="mt-1 text-stone-500">{link.transferred.length ? link.transferred.join(", ") : "Addis Ababa keyword"}</dd></div><div><dt className="font-bold text-stone-700">Not transferred</dt><dd className="mt-1 text-stone-500">{link.notTransferred.join(", ")}</dd></div></dl>
        <a href={link.url} target="_blank" rel="noopener noreferrer nofollow" onClick={() => track(link.id)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#183c34] px-4 text-sm font-bold text-white">Search {link.name}<ExternalLink size={15} /></a>
      </article>)}
    </div>
    <p className="mt-5 text-xs leading-5 text-stone-500">Betoch is not affiliated with or endorsed by these external sources unless a source is separately labeled as a Betoch partner.</p>
  </section>;
}

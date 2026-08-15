"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase";
type View = "Overview" | "Properties" | "Users" | "Verification" | "Reports";
type Item = Record<string, any>;
export function AdminWorkspace() {
  const [view, setView] = useState<View>("Overview"),
    [items, setItems] = useState<Item[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const request = useCallback(async (path: string, init?: RequestInit) => {
    const { data } = await getBrowserClient().auth.getSession();
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session?.access_token}`,
        ...init?.headers,
      },
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Admin request failed");
    return json;
  }, []);
  const load = useCallback(async () => {
    if (view === "Overview") {
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const path =
        view === "Properties"
          ? "/api/admin/properties"
          : view === "Users"
            ? "/api/admin/users"
            : view === "Verification"
              ? "/api/admin/verifications"
              : "/api/admin/reports";
      setItems((await request(path)).data || []);
    } catch (x) {
      setError(x instanceof Error ? x.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, [view, request]);
  useEffect(() => {
    load();
  }, [load]);
  async function patch(path: string, body: unknown) {
    setError("");
    try {
      await request(path, { method: "PATCH", body: JSON.stringify(body) });
      await load();
    } catch (x) {
      setError(x instanceof Error ? x.message : "Unable to update record");
    }
  }
  return (
    <div className="min-h-screen bg-[#f6f4ee]">
      <header className="border-b bg-[#173c34] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">
              Administration
            </p>
            <h1 className="font-serif text-2xl">Betoch operations</h1>
          </div>
          <Link href="/" className="text-sm">
            View marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">
        <nav className="flex gap-2 overflow-x-auto">
          {(
            [
              "Overview",
              "Properties",
              "Users",
              "Verification",
              "Reports",
            ] as View[]
          ).map((x) => (
            <button
              key={x}
              onClick={() => setView(x)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${view === x ? "bg-[#173c34] text-white" : "border bg-white"}`}
            >
              {x}
            </button>
          ))}
        </nav>
        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
        {view === "Overview" ? (
          <Overview request={request} />
        ) : loading ? (
          <p className="py-16 text-center text-stone-500">
            Loading {view.toLowerCase()}…
          </p>
        ) : (
          <section className="mt-7 overflow-hidden rounded-2xl border bg-white">
            <div className="border-b p-5">
              <h2 className="font-serif text-2xl text-[#173c34]">{view}</h2>
              <p className="text-sm text-stone-500">
                Authenticated production records
              </p>
            </div>
            <div className="divide-y">
              {items.length ? (
                items.map((item) => (
                  <AdminRow
                    key={item.id}
                    view={view}
                    item={item}
                    patch={patch}
                  />
                ))
              ) : (
                <p className="p-10 text-center text-stone-500">
                  No records in this queue.
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
function Overview({
  request,
}: {
  request: (path: string, init?: RequestInit) => Promise<any>;
}) {
  const [counts, setCounts] = useState({
    properties: 0,
    users: 0,
    verifications: 0,
    reports: 0,
  });
  useEffect(() => {
    Promise.all([
      request("/api/admin/properties"),
      request("/api/admin/users"),
      request("/api/admin/verifications"),
      request("/api/admin/reports"),
    ])
      .then(([p, u, v, r]) =>
        setCounts({
          properties: p.data?.length || 0,
          users: u.data?.length || 0,
          verifications:
            v.data?.filter((x: Item) => x.status === "pending").length || 0,
          reports:
            r.data?.filter((x: Item) =>
              ["open", "reviewing"].includes(x.status),
            ).length || 0,
        }),
      )
      .catch(() => {});
  }, [request]);
  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(counts).map(([key, value]) => (
        <div key={key} className="rounded-2xl border bg-white p-6">
          <p className="capitalize text-stone-500">{key}</p>
          <p className="mt-2 text-4xl font-bold text-[#173c34]">{value}</p>
        </div>
      ))}
    </div>
  );
}
function AdminRow({
  view,
  item,
  patch,
}: {
  view: View;
  item: Item;
  patch: (path: string, body: unknown) => Promise<void>;
}) {
  const title =
    view === "Properties"
      ? item.title
      : view === "Users"
        ? item.name
        : view === "Verification"
          ? item.properties?.title || item.verification_type
          : item.properties?.title || "Reported property";
  const subtitle =
    view === "Users"
      ? `${item.role} · ${item.agency_name || "Independent"}`
      : view === "Reports"
        ? `${item.reason?.replaceAll("_", " ")} · ${item.profiles?.name || "Reporter"}`
        : view === "Verification"
          ? item.verification_type
          : `${item.status} · ${item.verification_status}`;
  return (
    <article className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-xs capitalize text-stone-500">{subtitle}</p>
      </div>
      <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-bold capitalize">
        {item.suspended_at
          ? "suspended"
          : item.status || item.verification_status}
      </span>
      <div className="flex flex-wrap gap-2">
        {view === "Properties" ? (
          <>
            <button
              onClick={() =>
                patch(`/api/admin/properties/${item.id}`, {
                  status: "published",
                })
              }
              className="rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
            >
              Publish
            </button>
            <button
              onClick={() => {
                const reason = prompt("Rejection reason");
                if (reason)
                  patch(`/api/admin/properties/${item.id}`, {
                    status: "rejected",
                    moderation_reason: reason,
                  });
              }}
              className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-800"
            >
              Reject
            </button>
          </>
        ) : view === "Users" ? (
          <button
            onClick={() =>
              patch(`/api/admin/users/${item.id}`, {
                suspended: !item.suspended_at,
              })
            }
            className="rounded-full border px-3 py-2 text-xs font-bold"
          >
            {item.suspended_at ? "Reactivate" : "Suspend"}
          </button>
        ) : view === "Verification" ? (
          <>
            <button
              onClick={() =>
                patch(`/api/admin/verifications/${item.id}`, {
                  status: "approved",
                  notes: "Approved by administrator",
                })
              }
              className="rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
            >
              Approve
            </button>
            <button
              onClick={() =>
                patch(`/api/admin/verifications/${item.id}`, {
                  status: "rejected",
                  notes: "Rejected by administrator",
                })
              }
              className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-800"
            >
              Reject
            </button>
          </>
        ) : (
          <select
            value={item.status}
            onChange={(e) =>
              patch(`/api/admin/reports/${item.id}`, { status: e.target.value })
            }
            className="rounded-lg border px-3 py-2 text-xs"
          >
            <option value="open" disabled>
              open
            </option>
            <option value="reviewing">reviewing</option>
            <option value="resolved">resolved</option>
            <option value="dismissed">dismissed</option>
          </select>
        )}
      </div>
    </article>
  );
}

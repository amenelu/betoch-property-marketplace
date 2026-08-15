"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "@/components/icons";
import { useDemo } from "@/components/demo-provider";
export default function NewListing() {
  const { addListing, user } = useDemo();
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="min-h-screen bg-[#f6f4ee]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm">
            <ChevronLeft size={17} />
            Exit
          </Link>
          <b className="font-serif text-xl text-[#173c34]">Create a listing</b>
          <span className="text-xs text-stone-500">Saved securely</span>
        </div>
      </header>
      <form
        className="mx-auto grid max-w-4xl gap-6 px-5 py-10 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const d = new FormData(e.currentTarget),
            title = String(d.get("title"));
          try {
            await addListing({
              slug: `${title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}-${Date.now()}`,
              title,
              description: String(d.get("description")),
              property_type: String(d.get("property_type")),
              listing_type: String(d.get("listing_type")),
              price: Number(d.get("price")),
              currency: "ETB",
              area_sqm: Number(d.get("area_sqm")),
              bedrooms: Number(d.get("bedrooms")),
              bathrooms: Number(d.get("bathrooms")),
              parking_spaces: Number(d.get("parking_spaces")),
              city: "Addis Ababa",
              subcity: String(d.get("subcity")),
              neighborhood: String(d.get("neighborhood")),
              location_precision: "approximate",
              furnished: d.get("furnished") === "on",
              has_generator: d.get("has_generator") === "on",
              has_water_tank: d.get("has_water_tank") === "on",
              has_security: d.get("has_security") === "on",
            });
            router.push("/dashboard");
          } catch (x) {
            setError(x instanceof Error ? x.message : "Unable to save listing");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="sm:col-span-2">
          <p className="eyebrow">Seller workspace</p>
          <h1 className="font-serif text-4xl text-[#173c34]">
            Tell us about the property
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            It will be saved as a private draft for {user?.name}.
          </p>
        </div>
        <Field name="title" label="Listing title" />
        <Select
          name="property_type"
          label="Property type"
          options={[
            "apartment",
            "house",
            "villa",
            "condominium",
            "land",
            "commercial",
            "office",
            "warehouse",
            "other",
          ]}
        />
        <Select
          name="listing_type"
          label="Listing mode"
          options={[
            "sale",
            "long_term_rent",
            "medium_term_rent",
            "short_term_stay",
          ]}
        />
        <Field name="price" label="Price (ETB)" type="number" />
        <Field name="area_sqm" label="Area (m²)" type="number" />
        <Field
          name="bedrooms"
          label="Bedrooms"
          type="number"
          defaultValue="0"
        />
        <Field
          name="bathrooms"
          label="Bathrooms"
          type="number"
          defaultValue="0"
        />
        <Field
          name="parking_spaces"
          label="Parking spaces"
          type="number"
          defaultValue="0"
        />
        <Field name="subcity" label="Subcity" />
        <Field name="neighborhood" label="Neighborhood" />
        <label className="sm:col-span-2 text-sm font-semibold">
          Description
          <textarea
            name="description"
            required
            maxLength={5000}
            className="mt-2 h-36 w-full rounded-xl border p-3 font-normal"
          />
        </label>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          {[
            ["furnished", "Furnished"],
            ["has_generator", "Generator"],
            ["has_water_tank", "Water tank"],
            ["has_security", "Security"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 text-sm">
              <input name={name} type="checkbox" />
              {label}
            </label>
          ))}
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2"
          >
            {error}
          </p>
        ) : null}
        <button
          disabled={busy}
          className="min-h-12 rounded-full bg-[#d85d3f] px-6 font-bold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {busy ? "Saving…" : "Save draft"}
        </button>
      </form>
    </main>
  );
}
function Field({
  name,
  label,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue}
        className="mt-2 h-12 w-full rounded-xl border px-3 font-normal"
      />
    </label>
  );
}
function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        name={name}
        className="mt-2 h-12 w-full rounded-xl border px-3 font-normal capitalize"
      >
        {options.map((x) => (
          <option key={x} value={x}>
            {x.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

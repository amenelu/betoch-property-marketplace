"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Check } from "@/components/icons";
import { getBrowserClient } from "@/lib/supabase";
import { PhotoManager, type PropertyImage } from "@/components/photo-manager";

type EditableProperty = Record<string, any>;

export default function EditProperty({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<EditableProperty | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const sessionResult = await getBrowserClient().auth.getSession();
        const response = await fetch(`/api/properties/${params.id}`, {
          headers: { Authorization: `Bearer ${sessionResult.data.session?.access_token}` },
        });
        const json = await response.json();
        if (!response.ok) setError(json.error || "Unable to load property");
        else setProperty(json.data);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to load property");
      }
    }
    void load();
  }, [params.id]);

  if (error && !property) return <StateMessage message={error} />;
  if (!property) return <StateMessage message="Loading property…" />;

  return (
    <main className="min-h-screen bg-[#f6f4ee]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm"><ChevronLeft size={17} />Back to listings</Link>
          <p className="font-serif text-xl font-semibold text-[#173c34]">Edit property</p>
          <span className="text-xs capitalize text-stone-500">{property.status.replaceAll("_", " ")}</span>
        </div>
      </header>
      <form className="mx-auto grid max-w-3xl gap-6 px-5 py-10" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const payload = {
          title: String(form.get("title")), description: String(form.get("description")),
          property_type: String(form.get("property_type")), listing_type: String(form.get("listing_type")),
          price: Number(form.get("price")), area_sqm: Number(form.get("area_sqm")),
          bedrooms: Number(form.get("bedrooms")), bathrooms: Number(form.get("bathrooms")),
          parking_spaces: Number(form.get("parking_spaces")), subcity: String(form.get("subcity")),
          neighborhood: String(form.get("neighborhood")), furnished: form.get("furnished") === "on",
          has_generator: form.get("has_generator") === "on", has_water_tank: form.get("has_water_tank") === "on",
          has_security: form.get("has_security") === "on",
        };
        try {
          const { data } = await getBrowserClient().auth.getSession();
          const response = await fetch(`/api/properties/${params.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
            body: JSON.stringify(payload),
          });
          const json = await response.json();
          if (!response.ok) throw new Error(json.error || json.errors?.join(", ") || "Unable to save property");
          window.location.assign("/dashboard");
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Unable to save property");
          setBusy(false);
        }
      }}>
        <section className="rounded-2xl border bg-white p-6 sm:p-8">
          <h1 className="font-serif text-3xl font-semibold text-[#173c34]">Listing details</h1>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field name="title" label="Title" defaultValue={property.title} />
            <Select name="property_type" label="Property type" value={property.property_type} options={["apartment","house","villa","condominium","land","commercial","office","warehouse","other"]} />
            <Select name="listing_type" label="Listing mode" value={property.listing_type} options={["sale","rent","long_term_rent","medium_term_rent","short_term_stay"]} />
            <Field name="price" label="Price (ETB)" type="number" defaultValue={String(property.price)} />
            <Field name="area_sqm" label="Area (m²)" type="number" defaultValue={String(property.area_sqm)} />
            <Field name="bedrooms" label="Bedrooms" type="number" defaultValue={String(property.bedrooms)} />
            <Field name="bathrooms" label="Bathrooms" type="number" defaultValue={String(property.bathrooms)} />
            <Field name="parking_spaces" label="Parking spaces" type="number" defaultValue={String(property.parking_spaces)} />
            <Field name="subcity" label="Subcity" defaultValue={property.subcity || ""} />
            <Field name="neighborhood" label="Neighborhood" defaultValue={property.neighborhood || ""} />
            <label className="sm:col-span-2 text-sm font-semibold">Description<textarea name="description" required defaultValue={property.description} maxLength={5000} className="mt-2 h-36 w-full rounded-xl border p-3 font-normal" /></label>
            <div className="flex flex-wrap gap-5 sm:col-span-2">
              {[['furnished','Furnished'],['has_generator','Generator'],['has_water_tank','Water tank'],['has_security','Security']].map(([name,label]) => <label key={name} className="flex items-center gap-2 text-sm"><input name={name} type="checkbox" defaultChecked={Boolean(property[name])} />{label}</label>)}
            </div>
          </div>
        </section>
        <PhotoManager propertyId={params.id} initialImages={(property.property_images || []) as PropertyImage[]} />
        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="flex justify-end gap-3"><Link href="/dashboard" className="grid min-h-11 place-items-center px-5 text-sm">Cancel</Link><button disabled={busy} className="flex min-h-11 items-center gap-2 rounded-full bg-[#d85d3f] px-6 font-bold text-white disabled:opacity-60"><Check size={17} />{busy ? "Saving…" : "Save changes"}</button></div>
      </form>
    </main>
  );
}

function StateMessage({ message }: { message: string }) { return <main className="grid min-h-screen place-items-center bg-[#f6f4ee] text-stone-600"><div className="text-center"><p>{message}</p><Link href="/dashboard" className="mt-4 inline-block font-bold text-[#d85d3f]">Back to dashboard</Link></div></main>; }
function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) { return <label className="text-sm font-semibold">{label}<input name={name} required type={type} min={type === "number" ? 0 : undefined} defaultValue={defaultValue} className="mt-2 h-12 w-full rounded-xl border px-3 font-normal" /></label>; }
function Select({ name, label, value, options }: { name: string; label: string; value: string; options: string[] }) { return <label className="text-sm font-semibold">{label}<select name={name} defaultValue={value} className="mt-2 h-12 w-full rounded-xl border px-3 font-normal capitalize">{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>; }

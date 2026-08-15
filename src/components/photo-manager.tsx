"use client";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase";

export type PropertyImage = {
  id: string;
  storage_path: string;
  display_order: number;
  is_primary: boolean;
};

const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);

export function PhotoManager({ propertyId, initialImages }: { propertyId: string; initialImages: PropertyImage[] }) {
  const [images, setImages] = useState(() => [...initialImages].sort((a, b) => a.display_order - b.display_order));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const remaining = 20 - images.length;
  const urls = useMemo(() => new Map(images.map((image) => [image.id, `${baseUrl}/storage/v1/object/public/property-images/${image.storage_path}`])), [baseUrl, images]);

  async function accessToken() {
    const { data } = await getBrowserClient().auth.getSession();
    if (!data.session) throw new Error("Please sign in again");
    return data.session.access_token;
  }

  async function uploadFiles(selected: FileList | File[]) {
    const files = Array.from(selected);
    if (!files.length) return;
    if (files.length > remaining) { setNotice(`You can add ${remaining} more photo${remaining === 1 ? "" : "s"}.`); return; }
    const invalid = files.find((file) => !accepted.has(file.type) || file.size > 10 * 1024 * 1024);
    if (invalid) { setNotice(`${invalid.name}: use JPEG, PNG or WebP up to 10 MB.`); return; }
    setBusy(true);
    setNotice(`Preparing ${files.length} photo${files.length === 1 ? "" : "s"}…`);
    try {
      const token = await accessToken();
      const uploaded: PropertyImage[] = [];
      for (let index = 0; index < files.length; index++) {
        setNotice(`Uploading photo ${index + 1} of ${files.length}…`);
        const optimized = await optimizeImage(files[index]);
        const body = new FormData();
        body.append("file", optimized, optimized.name);
        const response = await fetch(`/api/properties/${propertyId}/images`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Unable to upload photo");
        uploaded.push(json.data);
      }
      setImages((current) => [...current, ...uploaded].sort((a, b) => a.display_order - b.display_order));
      setNotice(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Unable to upload photos");
    } finally { setBusy(false); }
  }

  async function mutate(imageId: string, body?: Record<string, unknown>, remove = false) {
    setBusy(true); setNotice("");
    try {
      const token = await accessToken();
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: remove ? "DELETE" : "PATCH",
        headers: { Authorization: `Bearer ${token}`, ...(remove ? {} : { "Content-Type": "application/json" }) },
        body: remove ? undefined : JSON.stringify(body),
      });
      if (!response.ok) { const json = await response.json(); throw new Error(json.error || "Unable to update photo"); }
      if (remove) setImages((current) => current.filter((image) => image.id !== imageId).map((image, index) => ({ ...image, display_order: index, is_primary: image.is_primary || (current.find((item) => item.id === imageId)?.is_primary === true && index === 0) })));
      else if (body?.primary) setImages((current) => current.map((image) => ({ ...image, is_primary: image.id === imageId })));
      else setImages((current) => moveImage(current, imageId, String(body?.direction)));
      setNotice(remove ? "Photo removed." : body?.primary ? "Primary photo updated." : "Photo order updated.");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Unable to update photo"); }
    finally { setBusy(false); }
  }

  return <section className="rounded-2xl border bg-white p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">Property gallery</p><h2 className="font-serif text-3xl font-semibold text-[#173c34]">Photos</h2><p className="mt-2 text-sm text-stone-500">Add up to 20 photos. The primary photo appears first in search results.</p></div><span className="rounded-full bg-[#e7eee9] px-3 py-1.5 text-xs font-bold text-[#173c34]">{images.length}/20</span></div>
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void uploadFiles(event.dataTransfer.files); }} className="mt-6 rounded-2xl border-2 border-dashed border-stone-300 bg-[#fbfaf6] p-7 text-center">
      <input ref={inputRef} id="property-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || remaining === 0} className="sr-only" onChange={(event) => event.target.files && void uploadFiles(event.target.files)} />
      <p className="font-semibold text-[#173c34]">Drag photos here or choose files</p><p className="mt-1 text-xs text-stone-500">JPEG, PNG or WebP · maximum 10 MB each · automatically optimized</p>
      <label htmlFor="property-photos" aria-disabled={busy || remaining === 0} className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[#173c34] px-5 text-sm font-bold text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-50">{busy ? "Working…" : remaining ? "Choose photos" : "20-photo limit reached"}</label>
    </div>
    {notice ? <p role="status" className="mt-4 rounded-xl bg-stone-100 p-3 text-sm text-stone-700">{notice}</p> : null}
    {images.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{images.map((image, index) => <article key={image.id} className="overflow-hidden rounded-xl border bg-white"><div className="relative aspect-[4/3] bg-stone-100"><Image src={urls.get(image.id) || ""} alt={`Property photo ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />{image.is_primary ? <span className="absolute left-2 top-2 rounded-full bg-[#173c34] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Primary</span> : null}</div><div className="grid grid-cols-2 gap-2 p-3"><button type="button" disabled={busy || image.is_primary} onClick={() => void mutate(image.id, { primary: true })} className="col-span-2 min-h-10 rounded-lg border text-xs font-bold disabled:opacity-40">Make primary</button><button type="button" disabled={busy || index === 0 || images.length === 20} onClick={() => void mutate(image.id, { direction: "left" })} className="min-h-10 rounded-lg border text-xs disabled:opacity-40">Move earlier</button><button type="button" disabled={busy || index === images.length - 1 || images.length === 20} onClick={() => void mutate(image.id, { direction: "right" })} className="min-h-10 rounded-lg border text-xs disabled:opacity-40">Move later</button><button type="button" disabled={busy} onClick={() => confirm("Remove this photo?") && void mutate(image.id, undefined, true)} className="col-span-2 min-h-10 rounded-lg bg-red-50 text-xs font-bold text-red-800 disabled:opacity-40">Remove photo</button></div></article>)}</div> : <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No photos yet. Add clear exterior, living-space and room photos before submitting the listing for review.</p>}
  </section>;
}

function moveImage(images: PropertyImage[], imageId: string, direction: string) {
  const next = [...images];
  const index = next.findIndex((image) => image.id === imageId);
  const target = direction === "left" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= next.length) return images;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((image, displayOrder) => ({ ...image, display_order: displayOrder }));
}

async function optimizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Unable to optimize image")), "image/webp", 0.82));
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

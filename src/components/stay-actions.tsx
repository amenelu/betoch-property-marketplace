"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "./demo-provider";
import { formatPrice } from "@/lib/data";

export function StayActions({ propertyId, propertyTitle, nightlyPrice, maxGuests = 1 }: { propertyId: string; propertyTitle: string; nightlyPrice: number; maxGuests?: number }) {
  const { user, requestStay, bookings, reviews, addReview } = useDemo();
  const [notice, setNotice] = useState("");
  const existing = bookings.find((booking) => booking.propertyId === propertyId && booking.guestId === user?.id);
  const existingReview = reviews.find((review) => review.bookingRequestId === existing?.id);
  const canReview = existing?.status === "completed" && !existingReview;
  return <div className="rounded-2xl border border-stone-200 bg-white p-5">
    <p className="text-2xl font-bold text-[#183c34]">{formatPrice(nightlyPrice)} <span className="text-sm font-normal text-stone-500">/ night</span></p>
    <form className="mt-5 grid grid-cols-2 gap-3" onSubmit={async (event) => { event.preventDefault(); if (!user) { setNotice("Sign in as a buyer to request this stay."); return; } const form = new FormData(event.currentTarget); const start = String(form.get("checkIn")); const end = String(form.get("checkOut")); if (end <= start) { setNotice("Check-out must be after check-in."); return; } try { await requestStay({ propertyId, propertyTitle, checkIn: start, checkOut: end, guestCount: Number(form.get("guests")), message: String(form.get("message")) }); setNotice("Request sent. The host will approve or reject it—no payment was taken."); } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Unable to request stay"); } }}>
      <label className="text-xs font-bold">Check-in<input name="checkIn" type="date" required className="mt-1 h-11 w-full rounded-lg border px-2 font-normal" /></label><label className="text-xs font-bold">Check-out<input name="checkOut" type="date" required className="mt-1 h-11 w-full rounded-lg border px-2 font-normal" /></label>
      <label className="col-span-2 text-xs font-bold">Guests<select name="guests" className="mt-1 h-11 w-full rounded-lg border px-2 font-normal">{Array.from({ length: maxGuests }, (_, index) => <option key={index + 1}>{index + 1}</option>)}</select></label>
      <label className="col-span-2 text-xs font-bold">Message<textarea name="message" required defaultValue="Hello, I would like to request these dates." className="mt-1 h-20 w-full rounded-lg border p-2 font-normal" /></label>
      <button disabled={existing?.status === "pending"} className="col-span-2 min-h-12 rounded-xl bg-[#d85d3f] font-bold text-white disabled:bg-stone-300">{existing?.status === "pending" ? "Request pending" : "Request stay"}</button>
    </form>
    <p className="mt-3 text-[11px] leading-4 text-stone-500">Request only. Approval confirms availability; payment and contracts happen outside Betoch.</p>
    {notice ? <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs">{notice} {!user ? <Link href="/login" className="font-bold underline">Sign in</Link> : null}</p> : null}
    {existingReview ? <p className="mt-4 text-sm font-bold text-emerald-700">You reviewed this completed stay.</p> : null}
    {canReview && existing ? <ReviewForm propertyId={propertyId} propertyTitle={propertyTitle} bookingRequestId={existing.id} onAdd={addReview} /> : null}
  </div>;
}

function ReviewForm({ propertyId, propertyTitle, bookingRequestId, onAdd }: { propertyId: string; propertyTitle: string; bookingRequestId: string; onAdd: ReturnType<typeof useDemo>["addReview"] }) {
  const [notice, setNotice] = useState("");
  return <form className="mt-5 border-t pt-5" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await onAdd({ propertyId, propertyTitle, bookingRequestId, rating: Number(form.get("rating")), title: String(form.get("title")), text: String(form.get("text")), stayType: "short_stay" }); setNotice("Review published."); } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Unable to publish review"); } }}>
    <p className="font-bold">Review your completed stay</p><select name="rating" className="mt-2 h-10 w-full rounded-lg border px-2"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select><input name="title" required minLength={2} maxLength={120} placeholder="Review title" className="mt-2 h-10 w-full rounded-lg border px-2" /><textarea name="text" required minLength={2} maxLength={2000} placeholder="Share your experience" className="mt-2 h-20 w-full rounded-lg border p-2" /><button className="mt-2 rounded-full bg-[#183c34] px-4 py-2 text-sm font-bold text-white">Publish review</button>{notice ? <p role="status" className="mt-2 text-sm text-emerald-700">{notice}</p> : null}
  </form>;
}

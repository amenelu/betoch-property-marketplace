"use client";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useDemo } from "@/components/demo-provider";

export default function MyStays() {
  const { bookings, updateBooking, user } = useDemo();
  const guestBookings = bookings.filter((booking) => booking.guestId === user?.id);
  return <><Header /><main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-12">
    <p className="eyebrow">Request · Approve · Contact · Stay · Review</p>
    <h1 className="section-title">My stay requests</h1>
    <p className="mt-3 text-stone-500">Track host decisions here. Betoch never charges you for a booking request.</p>
    <div className="mt-8 space-y-4">{guestBookings.length ? guestBookings.map((booking) => <article key={booking.id} className="rounded-2xl border bg-white p-5 sm:flex sm:items-center sm:justify-between">
      <div><p className="font-serif text-xl font-bold text-[#183c34]">{booking.propertyTitle}</p><p className="mt-1 text-sm text-stone-500">{booking.checkIn} → {booking.checkOut} · {booking.guestCount} guests</p><span className="mt-3 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-bold capitalize">{booking.status}</span>{booking.status === "approved" ? <p className="mt-3 text-xs text-emerald-700">Approved. Contact the host from the property page to confirm arrangements.</p> : null}</div>
      {["pending", "approved"].includes(booking.status) ? <button onClick={() => updateBooking(booking.id, "cancelled")} className="mt-4 rounded-full border px-4 py-2 text-sm sm:mt-0">Cancel request</button> : null}
    </article>) : <div className="rounded-2xl border border-dashed py-16 text-center"><p className="font-serif text-xl">No stay requests yet</p><Link href="/properties?listingType=short_term_stay" className="mt-4 inline-block font-bold text-[#d85d3f]">Explore stays</Link></div>}</div>
  </main><Footer /></>;
}

"use client";
import Link from "next/link";
import { useDemo } from "@/components/demo-provider";

export default function HostStays() {
  const { ready, user, bookings, updateBooking } = useDemo();
  if (!ready) return null;
  if (!user || !["owner", "broker", "admin"].includes(user.role)) return <main className="p-10 text-center"><p>Host access required.</p><Link href="/login" className="font-bold text-[#d85d3f]">Sign in</Link></main>;
  const hostedBookings = bookings.filter((booking) => booking.hostId === user.id);
  return <main className="min-h-screen bg-[#f6f4ee] p-5 lg:p-10"><div className="mx-auto max-w-5xl">
    <Link href="/dashboard" className="text-sm">← Seller workspace</Link><h1 className="mt-5 font-serif text-4xl text-[#173c34]">Stay requests</h1><p className="mt-2 text-stone-500">Review availability manually. Approval does not collect payment.</p>
    <div className="mt-8 space-y-4">{hostedBookings.length ? hostedBookings.map((booking) => <article key={booking.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-bold">{booking.propertyTitle}</p><p className="text-sm text-stone-500">{booking.guestName} · {booking.checkIn} → {booking.checkOut} · {booking.guestCount} guests</p><p className="mt-2 text-sm">“{booking.message}”</p></div><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold capitalize">{booking.status}</span></div>{booking.status === "pending" ? <div className="mt-4 flex gap-2 border-t pt-4"><button onClick={() => updateBooking(booking.id, "approved")} className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Approve</button><button onClick={() => updateBooking(booking.id, "rejected")} className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800">Reject</button></div> : booking.status === "approved" ? <button onClick={() => updateBooking(booking.id, "completed")} className="mt-4 rounded-full border px-4 py-2 text-sm font-bold">Mark stay completed</button> : null}</article>) : <div className="rounded-2xl border border-dashed bg-white py-16 text-center">No stay requests yet.</div>}</div>
  </div></main>;
}

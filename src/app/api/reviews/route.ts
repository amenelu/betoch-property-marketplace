import { NextRequest, NextResponse } from "next/server";
import { authenticated, bad } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await authenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data, error } = await auth.client
    .from("property_reviews")
    .select("*,properties(title)")
    .eq("reviewer_id", auth.user.id)
    .order("created_at", { ascending: false });
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await authenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await req.json();
  const rating = Number(body.rating);
  const title = String(body.title || "").trim();
  const reviewText = String(body.review_text || "").trim();
  if (!body.property_id || !body.booking_request_id || !Number.isInteger(rating) || rating < 1 || rating > 5 || title.length < 2 || title.length > 120 || reviewText.length < 2 || reviewText.length > 2000)
    return bad(["A completed stay, rating, title and review are required"]);
  const { data: booking } = await auth.client
    .from("booking_requests")
    .select("property_id,guest_id,status")
    .eq("id", body.booking_request_id)
    .single();
  if (!booking || booking.guest_id !== auth.user.id || booking.property_id !== body.property_id || booking.status !== "completed")
    return NextResponse.json({ error: "Only the guest may review a completed stay" }, { status: 403 });
  const { data, error } = await auth.client
    .from("property_reviews")
    .insert({
      property_id: body.property_id,
      booking_request_id: body.booking_request_id,
      reviewer_id: auth.user.id,
      rating,
      title,
      review_text: reviewText,
      stay_type: body.stay_type || "short_stay",
    })
    .select()
    .single();
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ data }, { status: 201 });
}

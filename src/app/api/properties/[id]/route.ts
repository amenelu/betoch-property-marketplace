import { NextRequest, NextResponse } from "next/server";
import { authenticated, bad } from "@/lib/api";
import { getServiceClient } from "@/lib/supabase";
import { validateProperty } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticated(req);
  if (auth) {
    const { data, error } = await auth.client
      .from("properties")
      .select("*,property_images(*)")
      .eq("id", params.id)
      .single();
    if (!error && data) return NextResponse.json({ data });
  }
  const db = getServiceClient();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const { data, error } = await db
    .from("properties")
    .select("*,property_images(*)")
    .eq("id", params.id)
    .eq("status", "published")
    .single();
  return error
    ? NextResponse.json({ error: "Not found" }, { status: 404 })
    : NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data: existing } = await auth.client.from("properties").select("*").eq("id", params.id).single();
  if (!existing) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  const body = await req.json();
  const editable = {
    title: String(body.title ?? existing.title).trim(),
    description: String(body.description ?? existing.description),
    property_type: body.property_type ?? existing.property_type,
    listing_type: body.listing_type ?? existing.listing_type,
    price: Number(body.price ?? existing.price),
    area_sqm: Number(body.area_sqm ?? existing.area_sqm),
    bedrooms: Number(body.bedrooms ?? existing.bedrooms),
    bathrooms: Number(body.bathrooms ?? existing.bathrooms),
    parking_spaces: Number(body.parking_spaces ?? existing.parking_spaces),
    subcity: String(body.subcity ?? existing.subcity ?? "").trim() || null,
    neighborhood: String(body.neighborhood ?? existing.neighborhood ?? "").trim() || null,
    furnished: body.furnished ?? existing.furnished,
    has_generator: body.has_generator ?? existing.has_generator,
    has_water_tank: body.has_water_tank ?? existing.has_water_tank,
    has_security: body.has_security ?? existing.has_security,
    updated_at: new Date().toISOString(),
  };
  const validation = validateProperty({ ...existing, ...editable });
  if (!validation.success) return bad(validation.errors);
  const { data, error } = await auth.client
    .from("properties")
    .update(editable)
    .eq("id", params.id)
    .select()
    .single();
  return error
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { error } = await auth.client.from("properties").delete().eq("id", params.id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : new NextResponse(null, { status: 204 });
}

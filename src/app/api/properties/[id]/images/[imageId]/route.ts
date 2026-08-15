import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/api";

async function ownedImages(req: NextRequest, propertyId: string) {
  const auth = await authenticated(req);
  if (!auth) return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const { data: property } = await auth.client.from("properties").select("owner_id").eq("id", propertyId).single();
  if (!property || property.owner_id !== auth.user.id)
    return { response: NextResponse.json({ error: "Property ownership required" }, { status: 403 }) };
  const { data, error } = await auth.client.from("property_images").select("*").eq("property_id", propertyId).order("display_order");
  if (error) return { response: NextResponse.json({ error: error.message }, { status: 400 }) };
  return { auth, images: data || [] };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  const result = await ownedImages(req, params.id);
  if (result.response) return result.response;
  const { auth, images } = result;
  const image = images.find((item) => item.id === params.imageId);
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const body = await req.json();
  if (body.primary === true) {
    const { error: clearError } = await auth.client.from("property_images").update({ is_primary: false }).eq("property_id", params.id).neq("id", params.imageId);
    if (clearError) return NextResponse.json({ error: clearError.message }, { status: 400 });
    const { data, error } = await auth.client.from("property_images").update({ is_primary: true }).eq("id", params.imageId).select().single();
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ data });
  }
  if (!["left", "right"].includes(body.direction)) return NextResponse.json({ error: "Choose primary, left or right" }, { status: 400 });
  const index = images.findIndex((item) => item.id === params.imageId);
  const otherIndex = body.direction === "left" ? index - 1 : index + 1;
  if (otherIndex < 0 || otherIndex >= images.length) return NextResponse.json({ data: images });
  const used = new Set(images.map((item) => Number(item.display_order)));
  const spare = Array.from({ length: 20 }, (_, value) => value).find((value) => !used.has(value));
  if (spare === undefined) return NextResponse.json({ error: "Remove one photo before reordering a full 20-photo gallery" }, { status: 409 });
  const other = images[otherIndex];
  const first = Number(image.display_order), second = Number(other.display_order);
  for (const [id, displayOrder] of [[image.id, spare], [other.id, first], [image.id, second]] as const) {
    const { error } = await auth.client.from("property_images").update({ display_order: displayOrder }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  const result = await ownedImages(req, params.id);
  if (result.response) return result.response;
  const { auth, images } = result;
  const image = images.find((item) => item.id === params.imageId);
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const { error: storageError } = await auth.client.storage.from("property-images").remove([image.storage_path]);
  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 400 });
  const { error } = await auth.client.from("property_images").delete().eq("id", params.imageId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const remaining = images.filter((item) => item.id !== params.imageId);
  for (let index = 0; index < remaining.length; index++) {
    const item = remaining[index];
    const updates: Record<string, unknown> = {};
    if (Number(item.display_order) !== index) updates.display_order = index;
    if (image.is_primary && index === 0) updates.is_primary = true;
    if (Object.keys(updates).length) await auth.client.from("property_images").update(updates).eq("id", item.id);
  }
  return new NextResponse(null, { status: 204 });
}

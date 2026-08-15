import { NextRequest, NextResponse } from "next/server";
import { adminAuthenticated } from "@/lib/api";
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await adminAuthenticated(req);
  if (!a)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  const { status, notes } = await req.json();
  if (!["approved", "rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { data, error } = await a.client
    .from("property_verifications")
    .update({
      status,
      notes: String(notes || "").slice(0, 2000),
      reviewed_by: a.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();
  return error
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : NextResponse.json({ data });
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuthenticated } from "@/lib/api";
export async function GET(req: NextRequest) {
  const a = await adminAuthenticated(req);
  if (!a)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  const { data, error } = await a.client
    .from("property_verifications")
    .select(
      "id,property_id,verification_type,status,notes,created_at,updated_at,properties(title)",
    )
    .order("created_at", { ascending: false });
  return error
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : NextResponse.json({ data });
}

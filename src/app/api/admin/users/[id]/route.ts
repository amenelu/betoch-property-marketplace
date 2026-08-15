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
  const { suspended } = await req.json();
  if (typeof suspended !== "boolean")
    return NextResponse.json(
      { error: "suspended must be boolean" },
      { status: 400 },
    );
  if (params.id === a.user.id)
    return NextResponse.json(
      { error: "Admins cannot suspend themselves" },
      { status: 409 },
    );
  const { data, error } = await a.client
    .from("profiles")
    .update({ suspended_at: suspended ? new Date().toISOString() : null })
    .eq("id", params.id)
    .select("id,name,role,suspended_at")
    .single();
  return error
    ? NextResponse.json({ error: error.message }, { status: 403 })
    : NextResponse.json({ data });
}

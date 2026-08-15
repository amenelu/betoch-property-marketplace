import { NextRequest, NextResponse } from "next/server";
import { adminAuthenticated } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await adminAuthenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await req.json();
  if (!["active", "paused", "disabled"].includes(body.status)) return NextResponse.json({ error: "Invalid source status" }, { status: 400 });
  if (body.status === "active" && !body.confirm_legal_review) return NextResponse.json({ error: "Terms and crawling authorization must be reviewed before activation" }, { status: 400 });
  const update = { status: body.status, ...(body.confirm_legal_review ? { terms_reviewed_at: new Date().toISOString(), robots_reviewed_at: new Date().toISOString() } : {}) };
  const { data, error } = await auth.client.from("property_sources").update(update).eq("id", params.id).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 403 }) : NextResponse.json({ data });
}

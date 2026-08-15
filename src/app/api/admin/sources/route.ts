import { NextRequest, NextResponse } from "next/server";
import { adminAuthenticated } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await adminAuthenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data, error } = await auth.client.from("property_sources").select("*,property_source_crawls(status,started_at,error_count)").order("created_at", { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 403 }) : NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await adminAuthenticated(req);
  if (!auth) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await req.json();
  if (!String(body.name || "").trim() || !isHttpUrl(body.base_url) || !["api", "feed", "website", "partner"].includes(body.source_type))
    return NextResponse.json({ error: "Name, HTTPS/HTTP base URL and a valid source type are required" }, { status: 400 });
  const { data, error } = await auth.client.from("property_sources").insert({ name: String(body.name).trim(), base_url: body.base_url, source_type: body.source_type, status: "paused", authorization_notes: String(body.authorization_notes || "").trim() || null }).select().single();
  return error ? NextResponse.json({ error: error.message }, { status: 403 }) : NextResponse.json({ data }, { status: 201 });
}

const isHttpUrl = (value: unknown) => { try { return ["http:", "https:"].includes(new URL(String(value)).protocol); } catch { return false; } };

import { NextRequest, NextResponse } from "next/server";
import { adminAuthenticated } from "@/lib/api";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const a = await adminAuthenticated(req);
  if (!a)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  const { data: verification, error } = await a.client
    .from("property_verifications")
    .select("document_storage_path")
    .eq("id", params.id)
    .single();
  if (error || !verification?.document_storage_path)
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  const { data, error: signError } = await a.client.storage
    .from("verification-documents")
    .createSignedUrl(verification.document_storage_path, 60);
  return signError
    ? NextResponse.json({ error: signError.message }, { status: 403 })
    : NextResponse.json({ url: data.signedUrl, expires_in: 60 });
}

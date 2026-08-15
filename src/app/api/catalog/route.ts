import {NextResponse} from "next/server";import {getPublishedProperties} from "@/lib/property-repository";
export async function GET(){try{return NextResponse.json({data:await getPublishedProperties()})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to load properties"},{status:500})}}

import { NextResponse } from "next/server";
import { getAiSettings } from "@/lib/ai/gateway";

export async function GET() {
  return NextResponse.json(getAiSettings());
}

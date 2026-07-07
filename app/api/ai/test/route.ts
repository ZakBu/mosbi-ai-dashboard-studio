import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { testAiProvider } from "@/lib/ai/gateway";

const TestSchema = z.object({
  provider: z.enum(["demo", "openai", "ollama"]).optional(),
  model: z.string().min(1).max(80).optional(),
  ollamaBaseUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = TestSchema.parse(await req.json());
    const result = await testAiProvider(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "unknown error" },
      { status: 400 },
    );
  }
}

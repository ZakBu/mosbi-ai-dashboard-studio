import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDatasetProfile } from "@/lib/ai/datasetProfile";
import { parseCsv } from "@/lib/editor/csv";
import { getCompactEditorComponentRegistry } from "@/lib/editor/componentRegistry";
import { createEditorDocument } from "@/lib/editor/documentFactory";
import { editorDefaultCsv, editorDefaultPrompt } from "@/lib/editor/sampleData";
import { saveEditorDocument } from "@/lib/editor/store";

const EditorBuildSchema = z.object({
  prompt: z.string().min(3).max(6000).optional(),
  data: z.string().min(10).optional(),
  seedComponentId: z.string().min(3).optional(),
  aiProvider: z.enum(["demo", "openai", "ollama"]).optional(),
  model: z.string().min(1).max(80).optional(),
  ollamaBaseUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = EditorBuildSchema.parse(await req.json());
    const csv = body.data ?? editorDefaultCsv;
    const parsed = parseCsv(csv);
    const datasetProfile = createDatasetProfile(parsed.records, parsed.columns);
    const provider = body.aiProvider ?? "demo";
    const model = body.model || (provider === "ollama" ? "llama3.1" : provider === "openai" ? "gpt-4.1-mini" : "local-editor-planner");

    const document = createEditorDocument({
      prompt: body.prompt ?? editorDefaultPrompt,
      seedComponentId: body.seedComponentId,
      columns: parsed.columns,
      rowCount: parsed.records.length,
      origin: req.nextUrl.origin,
      ai: {
        provider,
        model,
        mode: provider === "demo" ? "demo" : "planner",
        warnings: provider === "demo" ? [] : ["Editor API is using registry-constrained JSON schema fallback for this MVP build."],
        fallback: provider !== "demo",
        usage: {
          inputTokens: Math.round(JSON.stringify(datasetProfile).length / 4),
          outputTokens: 900,
          totalTokens: Math.round(JSON.stringify(datasetProfile).length / 4) + 900,
        },
      },
    });

    saveEditorDocument(document);

    return NextResponse.json({
      document,
      registry: getCompactEditorComponentRegistry(),
      ai: document.ai,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown error" },
      { status: 400 },
    );
  }
}

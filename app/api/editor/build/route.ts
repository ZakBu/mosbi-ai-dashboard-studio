import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateDashboardPlan } from "@/lib/ai/gateway";
import { createDatasetProfile } from "@/lib/ai/datasetProfile";
import { createExecutiveDashboardSource } from "@/lib/executive/compiler";
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
    const prompt = body.prompt ?? editorDefaultPrompt;
    const planResult = await generateDashboardPlan({
      prompt,
      datasetProfile,
      request: {
        provider,
        model: body.model,
        ollamaBaseUrl: body.ollamaBaseUrl,
      },
    });

    const source = createExecutiveDashboardSource({
      plan: planResult.plan,
      profile: datasetProfile,
      records: parsed.records,
    });

    const document = createEditorDocument({
      prompt,
      seedComponentId: body.seedComponentId,
      title: planResult.plan.title,
      columns: parsed.columns,
      rowCount: parsed.records.length,
      origin: req.nextUrl.origin,
      ai: planResult.ai,
    });

    document.pages = document.pages.map((page) => ({
      ...page,
      widgets: [
        {
          id: "executive_dashboard_shell",
          componentId: "executive.dashboard-shell",
          sourceLibrary: "executive",
          title: planResult.plan.title,
          subtitle: planResult.plan.narrative[0],
          layout: { x: 24, y: 92, w: 1232, h: 604 },
          props: { source },
          dataBinding: {
            datasetId: "uploaded_csv",
            columns: parsed.columns,
            transform: "semantic-dashboard-compiler",
          },
          locked: true,
        },
      ],
    }));

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

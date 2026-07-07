import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { DashboardDocument, EditorPatch } from "@/lib/editor/types";

const PatchSchema = z.object({
  document: z.custom<DashboardDocument>(),
  patch: z.custom<EditorPatch>(),
});

export async function POST(req: NextRequest) {
  try {
    const body = PatchSchema.parse(await req.json());
    const locked = new Set(body.patch.lockedWidgetIds);
    const document: DashboardDocument = {
      ...body.document,
      pages: body.document.pages.map((page) => ({
        ...page,
        widgets: page.widgets
          .filter((widget) => !body.patch.operations.some((operation) => operation.op === "deleteWidget" && operation.widgetId === widget.id && !locked.has(widget.id)))
          .map((widget) => {
            const operations = body.patch.operations.filter((operation) => "widgetId" in operation && operation.widgetId === widget.id && !locked.has(widget.id));
            return operations.reduce((current, operation) => {
              if (operation.op === "updateWidget") return { ...current, ...operation.changes, props: { ...current.props, ...operation.changes.props } };
              if (operation.op === "moveWidget" || operation.op === "resizeWidget") return { ...current, layout: operation.layout };
              if (operation.op === "replaceWidget") return { ...current, componentId: operation.componentId, props: { ...current.props, ...operation.props } };
              return current;
            }, widget);
          })
          .concat(body.patch.operations.filter((operation) => operation.op === "createWidget").map((operation) => operation.widget)),
      })),
      versions: [
        ...body.document.versions,
        { id: `patch_${Date.now().toString(36)}`, label: "AI patch", createdAt: new Date().toISOString() },
      ],
    };

    return NextResponse.json({ document, patch: body.patch });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown error" },
      { status: 400 },
    );
  }
}

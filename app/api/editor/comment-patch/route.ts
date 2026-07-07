import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCommentPatch } from "@/lib/editor/documentFactory";
import type { DashboardDocument } from "@/lib/editor/types";

const CommentPatchSchema = z.object({
  document: z.custom<DashboardDocument>(),
  targetIds: z.array(z.string().min(1)).min(1),
  text: z.string().min(2).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = CommentPatchSchema.parse(await req.json());
    const existingIds = new Set(body.document.pages.flatMap((page) => page.widgets.map((widget) => widget.id)));
    const targetIds = Array.from(new Set(body.targetIds)).filter((id) => existingIds.has(id));
    if (!targetIds.length) throw new Error("No selected widgets found in document.");

    return NextResponse.json({
      patch: createCommentPatch({ document: body.document, targetIds, text: body.text }),
      ai: {
        provider: "demo",
        model: "local-editor-comment-patcher",
        mode: "comment_patch",
        warnings: [],
        fallback: false,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "unknown error" },
      { status: 400 },
    );
  }
}

import { getCompactComponentRegistry } from "./componentRegistry";
import { createDemoDashboardPlan } from "./demoPlanner";
import {
  buildDashboardPlannerSystemPrompt,
  buildDashboardPlannerUserPrompt,
  buildCommentPatchSystemPrompt,
} from "./prompts";
import { DashboardPatchJsonSchema, DashboardPatchSchema, DashboardPlanJsonSchema, DashboardPlanSchema } from "./schemas";
import {
  AI_LIMITS,
  getAiSettings,
  getDefaultProvider,
  getOllamaBaseUrl,
  getOllamaModel,
  getOpenAiModel,
  isAllowedLocalOllamaUrl,
} from "./settings";
import type { AiPlanResult, AiProviderId, AiProviderRequest, DashboardPatch, DatasetProfile } from "./types";

type PatchableDashboard = {
  widgets: Array<{
    id: string;
    [key: string]: unknown;
  }>;
};

type PlanArgs = {
  prompt: string;
  datasetProfile: DatasetProfile;
  request?: AiProviderRequest;
};

function extractOpenAiText(response: any) {
  if (typeof response.output_text === "string") return response.output_text;
  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

function parseJsonObject(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function fallbackPlan(args: PlanArgs, warnings: string[] = []): AiPlanResult {
  return {
    plan: DashboardPlanSchema.parse(createDemoDashboardPlan(args.prompt, args.datasetProfile)),
    ai: {
      provider: "demo",
      model: "local-demo-planner",
      mode: "demo",
      warnings,
      fallback: warnings.length > 0,
    },
  };
}

function requestedProvider(request?: AiProviderRequest): AiProviderId {
  if (request?.provider === "openai" || request?.provider === "ollama" || request?.provider === "demo") {
    return request.provider;
  }
  return getDefaultProvider();
}

async function callOpenAiPlanner(args: PlanArgs): Promise<AiPlanResult> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackPlan(args, ["OPENAI_API_KEY is missing. Used demo planner fallback."]);
  }

  const model = getOpenAiModel(args.request);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_output_tokens: AI_LIMITS.maxOutputTokens,
      input: [
        { role: "system", content: buildDashboardPlannerSystemPrompt() },
        {
          role: "user",
          content: buildDashboardPlannerUserPrompt({
            userPrompt: args.prompt,
            datasetProfile: args.datasetProfile,
            componentRegistry: getCompactComponentRegistry(),
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "dashboard_plan",
          schema: DashboardPlanJsonSchema,
          strict: false,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return fallbackPlan(args, [`OpenAI planner failed (${response.status}): ${message.slice(0, 180)}`]);
  }

  const json = await response.json();
  const parsed = DashboardPlanSchema.parse(parseJsonObject(extractOpenAiText(json)));

  return {
    plan: parsed,
    ai: {
      provider: "openai",
      model,
      mode: "planner",
      usage: {
        inputTokens: json.usage?.input_tokens,
        outputTokens: json.usage?.output_tokens,
        totalTokens: json.usage?.total_tokens,
      },
      warnings: [],
      fallback: false,
    },
  };
}

async function callOllamaPlanner(args: PlanArgs): Promise<AiPlanResult> {
  const baseUrl = getOllamaBaseUrl(args.request);
  if (!isAllowedLocalOllamaUrl(baseUrl)) {
    return fallbackPlan(args, ["Ollama base URL must point to localhost. Used demo planner fallback."]);
  }

  const model = getOllamaModel(args.request);
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: DashboardPlanJsonSchema,
      options: {
        temperature: 0.2,
        num_predict: AI_LIMITS.maxOutputTokens,
      },
      messages: [
        { role: "system", content: buildDashboardPlannerSystemPrompt() },
        {
          role: "user",
          content: buildDashboardPlannerUserPrompt({
            userPrompt: args.prompt,
            datasetProfile: args.datasetProfile,
            componentRegistry: getCompactComponentRegistry(),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return fallbackPlan(args, [`Ollama planner failed (${response.status}): ${message.slice(0, 180)}`]);
  }

  const json = await response.json();
  const parsed = DashboardPlanSchema.parse(parseJsonObject(json.message?.content ?? json.response ?? ""));

  return {
    plan: parsed,
    ai: {
      provider: "ollama",
      model,
      mode: "planner",
      usage: {
        inputTokens: json.prompt_eval_count,
        outputTokens: json.eval_count,
        totalTokens: (json.prompt_eval_count ?? 0) + (json.eval_count ?? 0) || undefined,
      },
      warnings: [],
      fallback: false,
    },
  };
}

export async function generateDashboardPlan(args: PlanArgs): Promise<AiPlanResult> {
  const provider = requestedProvider(args.request);

  try {
    if (provider === "openai") return await callOpenAiPlanner(args);
    if (provider === "ollama") return await callOllamaPlanner(args);
    return fallbackPlan(args);
  } catch (error) {
    return fallbackPlan(args, [
      `AI planner error: ${error instanceof Error ? error.message : "unknown error"}. Used demo planner fallback.`,
    ]);
  }
}

function demoPatch(targetIds: string[], text: string): DashboardPatch {
  return {
    operations: targetIds.map((targetId) => ({
        op: "updateWidget",
        widgetId: targetId,
        changes: {
          intent: text.slice(0, 220),
          subtitle: targetIds.length > 1
            ? "AI patch requested from region comment"
            : "AI patch requested from anchored comment",
          accent: text.toLowerCase().includes("крит") || text.toLowerCase().includes("risk") ? "red" : undefined,
        },
      })),
    explanation: targetIds.length > 1
      ? "Prepared scoped widget updates from the selected comment region."
      : "Prepared a scoped widget update from the anchored comment.",
    affectedWidgetIds: targetIds,
  };
}

function validateScopedPatch(patch: DashboardPatch, allowedTargetIds: string[]) {
  const allowed = new Set(allowedTargetIds);
  const invalid = patch.affectedWidgetIds.filter((id) => !allowed.has(id));
  if (invalid.length) throw new Error(`Patch touches locked widgets: ${invalid.join(", ")}`);
  for (const operation of patch.operations) {
    if ("widgetId" in operation && !allowed.has(operation.widgetId)) {
      throw new Error(`Patch operation touches locked widget: ${operation.widgetId}`);
    }
  }
  return patch;
}

export async function generateCommentPatch(args: {
  dashboard: PatchableDashboard;
  targetId?: string;
  targetIds?: string[];
  region?: { x: number; y: number; w: number; h: number };
  text: string;
  request?: AiProviderRequest;
}) {
  const provider = requestedProvider(args.request);
  const targetIds = Array.from(new Set((args.targetIds?.length ? args.targetIds : args.targetId ? [args.targetId] : []).filter(Boolean)));
  if (!targetIds.length) throw new Error("At least one target widget is required");

  const targetWidgets = args.dashboard.widgets.filter((widget) => targetIds.includes(widget.id));
  if (targetWidgets.length !== targetIds.length) {
    const found = new Set(targetWidgets.map((widget) => widget.id));
    const missing = targetIds.filter((id) => !found.has(id));
    throw new Error(`Unknown target widget: ${missing.join(", ")}`);
  }

  const lockedWidgetIds = args.dashboard.widgets.map((widget) => widget.id).filter((id) => !targetIds.includes(id));
  const userContent = JSON.stringify({
    comment: args.text.slice(0, 2000),
    mode: targetIds.length > 1 ? "region" : "point",
    region: args.region,
    allowedTargetIds: targetIds,
    lockedWidgetIds,
    targetWidgets,
  });

  async function fallback(warnings: string[] = []) {
    return {
      patch: validateScopedPatch(DashboardPatchSchema.parse(demoPatch(targetIds, args.text)), targetIds),
      ai: {
        provider: "demo" as const,
        model: "local-demo-patch",
        mode: "comment_patch" as const,
        warnings,
        fallback: warnings.length > 0,
      },
      lockedWidgetIds,
    };
  }

  try {
    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) return fallback(["OPENAI_API_KEY is missing. Used demo patch fallback."]);
      const model = getOpenAiModel(args.request);
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_output_tokens: AI_LIMITS.maxPatchOutputTokens,
          input: [
            { role: "system", content: buildCommentPatchSystemPrompt() },
            { role: "user", content: userContent },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "dashboard_patch",
              schema: DashboardPatchJsonSchema,
              strict: false,
            },
          },
        }),
      });
      if (!response.ok) return fallback([`OpenAI patch failed (${response.status}). Used demo patch fallback.`]);
      const json = await response.json();
      const patch = validateScopedPatch(DashboardPatchSchema.parse(parseJsonObject(extractOpenAiText(json))), targetIds);
      return {
        patch,
        ai: {
          provider: "openai" as const,
          model,
          mode: "comment_patch" as const,
          usage: {
            inputTokens: json.usage?.input_tokens,
            outputTokens: json.usage?.output_tokens,
            totalTokens: json.usage?.total_tokens,
          },
          warnings: [],
          fallback: false,
        },
        lockedWidgetIds,
      };
    }

    if (provider === "ollama") {
      const baseUrl = getOllamaBaseUrl(args.request);
      if (!isAllowedLocalOllamaUrl(baseUrl)) return fallback(["Ollama base URL must point to localhost."]);
      const model = getOllamaModel(args.request);
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          format: DashboardPatchJsonSchema,
          options: { temperature: 0.2, num_predict: AI_LIMITS.maxPatchOutputTokens },
          messages: [
            { role: "system", content: buildCommentPatchSystemPrompt() },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (!response.ok) return fallback([`Ollama patch failed (${response.status}). Used demo patch fallback.`]);
      const json = await response.json();
      const patch = validateScopedPatch(DashboardPatchSchema.parse(parseJsonObject(json.message?.content ?? json.response ?? "")), targetIds);
      return {
        patch,
        ai: {
          provider: "ollama" as const,
          model,
          mode: "comment_patch" as const,
          usage: {
            inputTokens: json.prompt_eval_count,
            outputTokens: json.eval_count,
            totalTokens: (json.prompt_eval_count ?? 0) + (json.eval_count ?? 0) || undefined,
          },
          warnings: [],
          fallback: false,
        },
        lockedWidgetIds,
      };
    }

    return fallback();
  } catch (error) {
    return fallback([`AI patch error: ${error instanceof Error ? error.message : "unknown error"}.`]);
  }
}

export async function testAiProvider(request?: AiProviderRequest) {
  const provider = requestedProvider(request);
  if (provider === "demo") {
    return { ok: true, provider, model: "local-demo-planner", message: "Demo planner is always available." };
  }

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      return { ok: false, provider, model: getOpenAiModel(request), message: "OPENAI_API_KEY is missing." };
    }
    const result = await callOpenAiPlanner({
      prompt: "Build a tiny executive dashboard.",
      datasetProfile: {
        rowCount: 2,
        columnCount: 2,
        columns: [
          { name: "date", type: "date", nonEmpty: 2, examples: ["2026-07-01"] },
          { name: "value", type: "number", nonEmpty: 2, examples: [10], min: 10, max: 20 },
        ],
        sampleRows: [{ date: "2026-07-01", value: 10 }],
      },
      request,
    });
    return {
      ok: !result.ai.fallback,
      provider: result.ai.provider,
      model: result.ai.model,
      message: result.ai.fallback ? result.ai.warnings.join(" ") : "OpenAI planner returned a valid plan.",
    };
  }

  const result = await callOllamaPlanner({
    prompt: "Build a tiny executive dashboard.",
    datasetProfile: {
      rowCount: 2,
      columnCount: 2,
      columns: [
        { name: "date", type: "date", nonEmpty: 2, examples: ["2026-07-01"] },
        { name: "value", type: "number", nonEmpty: 2, examples: [10], min: 10, max: 20 },
      ],
      sampleRows: [{ date: "2026-07-01", value: 10 }],
    },
    request,
  });
  return {
    ok: !result.ai.fallback,
    provider: result.ai.provider,
    model: result.ai.model,
    message: result.ai.fallback ? result.ai.warnings.join(" ") : "Ollama planner returned a valid plan.",
  };
}

export { getAiSettings };

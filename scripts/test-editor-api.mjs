import assert from "node:assert/strict";

const baseUrl = process.env.MOSBI_BASE_URL ?? "http://localhost:3000";

const fuelPrompt =
  "Собери executive dashboard 16:9 по доступности топлива в Москве: текущая ситуация, закрытые АЗС, очереди, риски по сетям, районы с проблемами, причины и прогноз на неделю.";

const fuelCsv = `date,company,district,station_id,status,queue_count,fuel_type,risk_score,reason
2026-07-01,Лукойл,ЦАО,LK-001,open,2,АИ-95,18,none
2026-07-01,Лукойл,САО,LK-002,no_fuel,19,АИ-95,82,no_delivery
2026-07-01,Роснефть,ЦАО,RN-001,open,3,АИ-95,22,none
2026-07-01,Татнефть,ЮВАО,TN-002,no_fuel,11,АИ-95,69,no_delivery
2026-07-02,Лукойл,ЦАО,LK-001,open,4,АИ-95,20,none
2026-07-02,Лукойл,САО,LK-002,no_fuel,21,АИ-95,86,no_delivery
2026-07-02,Роснефть,ЦАО,RN-001,open,2,АИ-95,20,none
2026-07-02,Татнефть,ЮВАО,TN-002,no_fuel,12,АИ-95,71,no_delivery`;

const settingsResponse = await fetch(`${baseUrl}/api/ai/settings`);
assert.equal(settingsResponse.status, 200);
const settings = await settingsResponse.json();
assert.ok(settings.providers.some((provider) => provider.id === "demo"), "demo provider is required");
assert.ok(settings.providers.some((provider) => provider.id === "openai"), "openai provider is required");
assert.ok(settings.providers.some((provider) => provider.id === "ollama"), "ollama provider is required");

const aiTestResponse = await fetch(`${baseUrl}/api/ai/test`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ provider: "demo" }),
});
assert.equal(aiTestResponse.status, 200);
const aiTest = await aiTestResponse.json();
assert.equal(aiTest.ok, true);

const editorBuildResponse = await fetch(`${baseUrl}/api/editor/build`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: fuelPrompt,
    data: fuelCsv,
    seedComponentId: "tremor.area-chart",
    aiProvider: "demo",
  }),
});
assert.equal(editorBuildResponse.status, 200);
const editorBuild = await editorBuildResponse.json();
assert.ok(editorBuild.document.id, "editor document id is required");
assert.equal(editorBuild.document.pages[0].format, "16:9");
assert.ok(editorBuild.document.embedUrl.includes(`/embed/${editorBuild.document.id}`), "embed url should include editor document id");
assert.ok(editorBuild.registry.length >= 10, "editor registry should expose Tremor widgets");
assert.ok(editorBuild.registry.every((item) => item.sourceLibrary === "tremor"), "active editor registry should be Tremor-only");
assert.ok(editorBuild.document.pages[0].widgets.every((widget) => widget.sourceLibrary === "tremor"), "editor document should use Tremor-only widgets");

const editorCommentPatchResponse = await fetch(`${baseUrl}/api/editor/comment-patch`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    document: editorBuild.document,
    targetIds: ["trend_availability"],
    text: "Правь только этот график, остальные виджеты должны остаться locked.",
  }),
});
assert.equal(editorCommentPatchResponse.status, 200);
const editorPatch = await editorCommentPatchResponse.json();
assert.deepEqual(editorPatch.patch.affectedWidgetIds, ["trend_availability"]);
assert.ok(editorPatch.patch.lockedWidgetIds.includes("kpi_total"), "non-target editor widgets should be locked");

const patchApplyResponse = await fetch(`${baseUrl}/api/editor/patch`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ document: editorBuild.document, patch: editorPatch.patch }),
});
assert.equal(patchApplyResponse.status, 200);
const patched = await patchApplyResponse.json();
assert.ok(patched.document.versions.length > editorBuild.document.versions.length, "patch should create a new version");

const embedResponse = await fetch(editorBuild.document.embedUrl);
assert.equal(embedResponse.status, 200);
const embedHtml = await embedResponse.text();
assert.ok(embedHtml.includes("mos.bi / published dashboard"), "embed should render editor document");

console.log(JSON.stringify({
  ok: true,
  provider: editorBuild.ai.provider,
  registryCount: editorBuild.registry.length,
  editorDocumentId: editorBuild.document.id,
  editorWidgets: editorBuild.document.pages[0].widgets.length,
  embedUrl: editorBuild.document.embedUrl,
}, null, 2));

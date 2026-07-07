import type { DashboardDocument } from "./types";

const STORE_KEY = "__MOSBI_EDITOR_DOCUMENTS__";

type EditorStore = Map<string, DashboardDocument>;

function getStore(): EditorStore {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: EditorStore;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = new Map();
  }

  return globalStore[STORE_KEY];
}

export function saveEditorDocument(document: DashboardDocument) {
  getStore().set(document.id, document);
}

export function getEditorDocument(id: string) {
  return getStore().get(id);
}

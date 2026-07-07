import { EditorEmbedRenderer } from "@/components/editor/EditorEmbedRenderer";
import { getEditorDocument } from "@/lib/editor/store";

export const dynamic = "force-dynamic";

export default async function EmbedDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const editorDocument = getEditorDocument(id);
  if (editorDocument) {
    return <EditorEmbedRenderer document={editorDocument} />;
  }

  return (
    <main className="editor-embed">
      <section className="editor-sheet editor-sheet--embed">
        <header className="editor-sheet__title">
          <div>
            <span>mos.bi / published dashboard</span>
            <h1>Dashboard not found</h1>
          </div>
          <em>editor document store</em>
        </header>
      </section>
    </main>
  );
}

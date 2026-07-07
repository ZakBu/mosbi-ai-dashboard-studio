import { WidgetRenderer } from "./WidgetRenderer";
import type { DashboardDocument } from "@/lib/editor/types";

export function EditorEmbedRenderer({ document }: { document: DashboardDocument }) {
  const page = document.pages[0];

  return (
    <main className="editor-embed">
      <section className="editor-sheet editor-sheet--embed" style={{ width: page.width, height: page.height }}>
        <header className="editor-sheet__title">
          <div>
            <span>mos.bi / published dashboard</span>
            <h1>{document.title}</h1>
          </div>
          <em>{document.ai?.provider ?? "demo"} · {document.theme}</em>
        </header>
        {page.widgets.map((widget) => (
          <div
            key={widget.id}
            className="editor-canvas-widget editor-canvas-widget--embed"
            data-widget-id={widget.id}
            style={{
              left: widget.layout.x,
              top: widget.layout.y,
              width: widget.layout.w,
              height: widget.layout.h,
            }}
          >
            <div className="editor-canvas-widget__chrome">
              <span>{widget.sourceLibrary}</span>
            </div>
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </section>
    </main>
  );
}

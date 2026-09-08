import { useEffect, useState } from "react";
import { getTheme } from "../lib/generateBackground";
import { resolveImageSrc } from "../lib/templateLibrary";
import type { SavedTemplate } from "../lib/types";

type Props = {
  templates: SavedTemplate[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

function Thumb({
  template,
  active,
  onSelect,
  onDelete,
}: {
  template: SavedTemplate;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (template.kind === "upload") {
      resolveImageSrc(template).then((url) => {
        if (!cancelled) setSrc(url);
      });
    } else {
      setSrc(null);
    }
    return () => {
      cancelled = true;
    };
  }, [template]);

  const theme =
    template.kind === "generated" && template.seed
      ? getTheme(template.seed.themeId)
      : null;

  return (
    <div className={`lib-item ${active ? "active" : ""}`}>
      <button type="button" className="lib-thumb" onClick={onSelect} title={template.name}>
        {src ? (
          <span className="lib-thumb-img" style={{ backgroundImage: `url(${src})` }} />
        ) : (
          <span
            className="lib-thumb-gen"
            style={{ background: theme?.bg ?? "#333", color: theme?.accent ?? "#aaa" }}
          >
            {theme?.name?.slice(0, 1) ?? "T"}
          </span>
        )}
        <span className="lib-thumb-label">{template.name}</span>
      </button>
      <button
        type="button"
        className="lib-delete"
        aria-label={`Hapus ${template.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </button>
    </div>
  );
}

export function TemplateLibrary({
  templates,
  activeId,
  onSelect,
  onDelete,
}: Props) {
  if (templates.length === 0) {
    return (
      <div className="lib-empty">
        Belum ada template. Unggah gambar atau buat yang baru.
      </div>
    );
  }

  return (
    <div className="lib-strip">
      {templates.map((t) => (
        <Thumb
          key={t.id}
          template={t}
          active={t.id === activeId}
          onSelect={() => onSelect(t.id)}
          onDelete={() => onDelete(t.id)}
        />
      ))}
    </div>
  );
}

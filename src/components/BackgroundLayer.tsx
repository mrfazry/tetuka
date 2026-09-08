import { getTheme } from "../lib/generateBackground";
import type { SavedTemplate, TemplateSeed } from "../lib/types";

type Props = {
  template: SavedTemplate | null;
  imageSrc: string | null;
  className?: string;
};

function ProceduralBg({ seed }: { seed: TemplateSeed }) {
  const theme = getTheme(seed.themeId);
  const corner = {
    tl: { top: "-8%", left: "-8%" },
    tr: { top: "-8%", right: "-8%" },
    bl: { bottom: "-8%", left: "-8%" },
    br: { bottom: "-8%", right: "-8%" },
  }[seed.accentCorner];

  return (
    <div
      className="bg-procedural"
      style={{ background: theme.bg, color: theme.accent }}
    >
      {seed.pattern === "gradient" && (
        <div
          className="bg-gradient"
          style={{
            background: `linear-gradient(${seed.angle}deg, ${theme.bg} 0%, ${theme.accent}55 50%, ${theme.bg} 100%)`,
          }}
        />
      )}
      {seed.pattern === "dots" && (
        <div
          className="bg-dots"
          style={{
            backgroundImage: `radial-gradient(${theme.accent}55 1.5px, transparent 1.5px)`,
          }}
        />
      )}
      {seed.pattern === "lines" && (
        <div
          className="bg-lines"
          style={{
            backgroundImage: `repeating-linear-gradient(${seed.angle}deg, ${theme.accent}33 0 2px, transparent 2px 28px)`,
          }}
        />
      )}
      {seed.pattern === "blobs" && (
        <div className="bg-blob" style={{ ...corner, background: theme.accent }} />
      )}
      {(seed.pattern === "solid" || seed.pattern === "gradient") && (
        <div
          className="bg-blob soft"
          style={{ ...corner, background: theme.accent }}
        />
      )}
    </div>
  );
}

export function BackgroundLayer({ template, imageSrc, className }: Props) {
  if (!template) {
    return <div className={`bg-empty ${className ?? ""}`} />;
  }

  if (template.kind === "upload" && imageSrc) {
    return (
      <div
        className={`bg-image ${className ?? ""}`}
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
    );
  }

  if (template.seed) {
    return (
      <div className={className}>
        <ProceduralBg seed={template.seed} />
      </div>
    );
  }

  return <div className={`bg-empty ${className ?? ""}`} />;
}

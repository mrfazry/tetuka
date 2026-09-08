import { getTheme } from "../lib/generateBackground";
import type { CanvasSize, SavedTemplate } from "../lib/types";
import { BackgroundLayer } from "./BackgroundLayer";

type Props = {
  text: string;
  template: SavedTemplate | null;
  imageSrc: string | null;
  size: CanvasSize;
  pageIndex: number;
  pageTotal: number;
  scale?: number;
  slideRef?: (el: HTMLDivElement | null) => void;
};

export function Slide({
  text,
  template,
  imageSrc,
  size,
  pageIndex,
  pageTotal,
  scale = 1,
  slideRef,
}: Props) {
  const theme =
    template?.kind === "generated" && template.seed
      ? getTheme(template.seed.themeId)
      : null;

  const textColor = theme?.text ?? "#f8fafc";
  const scrim =
    theme?.scrim ??
    (template?.kind === "upload"
      ? "rgba(0, 0, 0, 0.55)"
      : "rgba(20, 24, 32, 0.7)");

  return (
    <div
      className="slide-scaler"
      style={{
        width: size.width * scale,
        height: size.height * scale,
      }}
    >
      <div
        ref={slideRef}
        className="slide"
        style={{
          width: size.width,
          height: size.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          color: textColor,
        }}
      >
        <BackgroundLayer template={template} imageSrc={imageSrc} />
        <div className="slide-content">
          <div className="slide-scrim" style={{ background: scrim }}>
            <p className="slide-text">{text || "Tempel teks untuk pratinjau…"}</p>
          </div>
          {pageTotal > 1 && (
            <div className="slide-page" style={{ color: textColor }}>
              {pageIndex + 1} / {pageTotal}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

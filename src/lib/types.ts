export type CanvasSize = {
  width: 1080;
  height: 1080 | 1350;
  label: string;
};

export const CANVAS_PORTRAIT: CanvasSize = {
  width: 1080,
  height: 1350,
  label: "1080 × 1350",
};

export const CANVAS_SQUARE: CanvasSize = {
  width: 1080,
  height: 1080,
  label: "1080 × 1080",
};

export type PatternKind = "solid" | "gradient" | "dots" | "lines" | "blobs";
export type AccentCorner = "tl" | "tr" | "bl" | "br";
export type Angle = 0 | 45 | 90 | 135;

export type TemplateSeed = {
  themeId: string;
  pattern: PatternKind;
  angle: Angle;
  accentCorner: AccentCorner;
};

export type Theme = {
  id: string;
  name: string;
  bg: string;
  accent: string;
  text: string;
  muted: string;
  scrim: string;
  mode: "light" | "dark";
};

export type SavedTemplate = {
  id: string;
  name: string;
  kind: "upload" | "generated";
  createdAt: string;
  /** Relative path under app data, or object URL / data URL in browser */
  imagePath?: string;
  /** Browser-only: base64 data for uploaded image */
  imageData?: string;
  seed?: TemplateSeed;
};

export type AppSettings = {
  lastTemplateId: string | null;
  canvas: "portrait" | "square";
  autoUpdate: boolean;
};

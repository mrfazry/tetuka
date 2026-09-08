import type {
  AccentCorner,
  Angle,
  PatternKind,
  TemplateSeed,
  Theme,
} from "./types";

export const THEMES: Theme[] = [
  {
    id: "slate",
    name: "Batu tulis",
    bg: "#1e293b",
    accent: "#94a3b8",
    text: "#f8fafc",
    muted: "#cbd5e1",
    scrim: "rgba(15, 23, 42, 0.72)",
    mode: "dark",
  },
  {
    id: "olive",
    name: "Zaitun",
    bg: "#3f4a3a",
    accent: "#a3b18a",
    text: "#f4f1de",
    muted: "#d8e2c8",
    scrim: "rgba(40, 48, 36, 0.75)",
    mode: "dark",
  },
  {
    id: "navy",
    name: "Navy",
    bg: "#0f2744",
    accent: "#5b8def",
    text: "#eef4ff",
    muted: "#b6c7e3",
    scrim: "rgba(8, 20, 40, 0.78)",
    mode: "dark",
  },
  {
    id: "terracotta",
    name: "Terakota",
    bg: "#8c4a32",
    accent: "#e8b4a0",
    text: "#fff6f0",
    muted: "#f0d2c4",
    scrim: "rgba(70, 34, 22, 0.72)",
    mode: "dark",
  },
  {
    id: "ink",
    name: "Tinta",
    bg: "#121212",
    accent: "#6b7280",
    text: "#f5f5f5",
    muted: "#d4d4d4",
    scrim: "rgba(0, 0, 0, 0.7)",
    mode: "dark",
  },
  {
    id: "sand",
    name: "Pasir",
    bg: "#e8dcc8",
    accent: "#b08968",
    text: "#2c2418",
    muted: "#5c4e3c",
    scrim: "rgba(255, 250, 240, 0.82)",
    mode: "light",
  },
  {
    id: "mist",
    name: "Kabut",
    bg: "#dce4ec",
    accent: "#6d8aa8",
    text: "#1a2836",
    muted: "#3d5266",
    scrim: "rgba(245, 248, 252, 0.85)",
    mode: "light",
  },
  {
    id: "forest",
    name: "Hutan",
    bg: "#1f3d2b",
    accent: "#6fbf8a",
    text: "#ecf8ef",
    muted: "#b7d9c2",
    scrim: "rgba(16, 36, 24, 0.76)",
    mode: "dark",
  },
  {
    id: "rose",
    name: "Mawar",
    bg: "#f3e0e4",
    accent: "#c97b8a",
    text: "#3a1f28",
    muted: "#6b4450",
    scrim: "rgba(255, 245, 247, 0.84)",
    mode: "light",
  },
  {
    id: "charcoal",
    name: "Arang",
    bg: "#2a2e34",
    accent: "#d4a574",
    text: "#f2efe9",
    muted: "#c9c3b8",
    scrim: "rgba(20, 22, 26, 0.74)",
    mode: "dark",
  },
];

const PATTERNS: PatternKind[] = ["solid", "gradient", "dots", "lines", "blobs"];
const PATTERN_LABELS: Record<PatternKind, string> = {
  solid: "polos",
  gradient: "gradien",
  dots: "titik",
  lines: "garis",
  blobs: "bercak",
};
const ANGLES: Angle[] = [0, 45, 90, 135];
const CORNERS: AccentCorner[] = ["tl", "tr", "bl", "br"];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function getTheme(themeId: string): Theme {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0]!;
}

export function rollSeed(): TemplateSeed {
  return {
    themeId: pick(THEMES).id,
    pattern: pick(PATTERNS),
    angle: pick(ANGLES),
    accentCorner: pick(CORNERS),
  };
}

export function seedDisplayName(seed: TemplateSeed): string {
  const theme = getTheme(seed.themeId);
  return `${theme.name} · ${PATTERN_LABELS[seed.pattern]}`;
}

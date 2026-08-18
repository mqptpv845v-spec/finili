// Aspect-ratio glyph: a small rectangle whose proportions mirror the format.
// One implementation for both the format cards ("card") and the sidebar
// list ("inline") — previously duplicated with diverging thresholds.
type GlyphSize = "card" | "inline";

interface GeometricGlyphProps {
  widthRatio: number;
  heightRatio: number;
  size?: GlyphSize;
}

type Shape = "banner" | "landscape" | "square" | "vertical" | "portrait";

const SHAPE_TITLES: Record<Shape, string> = {
  banner: "Landscape banner",
  landscape: "Landscape",
  square: "Square (1:1)",
  vertical: "Vertical (9:16)",
  portrait: "Portrait",
};

const SHAPE_CLASSES: Record<GlyphSize, Record<Shape, string>> = {
  card: {
    banner: "w-10 h-3.5",
    landscape: "w-8 h-5.5",
    square: "w-6 h-6",
    vertical: "w-4.5 h-8",
    portrait: "w-5.5 h-7",
  },
  inline: {
    banner: "w-3 h-1.5",
    landscape: "w-2.5 h-2",
    square: "w-2 h-2",
    vertical: "w-1.5 h-3",
    portrait: "w-2 h-2.5",
  },
};

function shapeFor(ratio: number): Shape {
  if (ratio > 2.5) return "banner";
  if (ratio > 1.05) return "landscape";
  if (ratio >= 0.95) return "square";
  if (ratio < 0.65) return "vertical";
  return "portrait";
}

export function GeometricGlyph({ widthRatio, heightRatio, size = "card" }: GeometricGlyphProps) {
  const shape = shapeFor(widthRatio / heightRatio);
  const base =
    size === "card"
      ? "border border-black bg-transparent shrink-0"
      : "inline-block border border-black bg-white shrink-0";

  return <span className={`${base} ${SHAPE_CLASSES[size][shape]}`} title={SHAPE_TITLES[shape]} />;
}

import React from "react";

interface CropFrameProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  markColor?: string; // CSS color (default per design rule 4: pure black; use token colors like var(--color-cyan))
  markLength?: number; // length of crop mark lines in px (default: 12, follows 4px grid)
  markThickness?: number; // thickness in px (default: 0.5)
  gap?: number; // offset gap from corner vertex in px (default: 4, lines never touch)
  offset?: number; // optional alias for gap
  style?: React.CSSProperties;
}

/**
 * CropFrame renders authentic print pre-flight crop marks (skärmärken).
 * The lines project along the trim axes but have an offset gap from the corner vertex
 * so the horizontal and vertical lines never touch each other.
 */
export const CropFrame: React.FC<CropFrameProps> = ({
  children,
  id,
  className = "",
  markColor = "black",
  markLength = 12,
  markThickness = 0.5,
  gap = 4,
  offset,
  style = {},
}) => {
  const actualGap = offset !== undefined ? offset : gap;

  return (
    <div id={id} className={`relative crop-container ${className}`} style={style}>
      {/* Top Left Corner */}
      {/* Vertical line: along left edge (x = 0), extending UP from y = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          top: `-${actualGap + markLength}px`,
          left: `0px`,
          width: `${markThickness}px`,
          height: `${markLength}px`,
          backgroundColor: markColor,
        }}
      />
      {/* Horizontal line: along top edge (y = 0), extending LEFT from x = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          top: `0px`,
          left: `-${actualGap + markLength}px`,
          width: `${markLength}px`,
          height: `${markThickness}px`,
          backgroundColor: markColor,
        }}
      />

      {/* Top Right Corner */}
      {/* Vertical line: along right edge (x = 0), extending UP from y = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          top: `-${actualGap + markLength}px`,
          right: `0px`,
          width: `${markThickness}px`,
          height: `${markLength}px`,
          backgroundColor: markColor,
        }}
      />
      {/* Horizontal line: along top edge (y = 0), extending RIGHT from x = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          top: `0px`,
          right: `-${actualGap + markLength}px`,
          width: `${markLength}px`,
          height: `${markThickness}px`,
          backgroundColor: markColor,
        }}
      />

      {/* Bottom Left Corner */}
      {/* Vertical line: along left edge (x = 0), extending DOWN from y = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          bottom: `-${actualGap + markLength}px`,
          left: `0px`,
          width: `${markThickness}px`,
          height: `${markLength}px`,
          backgroundColor: markColor,
        }}
      />
      {/* Horizontal line: along bottom edge (y = 0), extending LEFT from x = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          bottom: `0px`,
          left: `-${actualGap + markLength}px`,
          width: `${markLength}px`,
          height: `${markThickness}px`,
          backgroundColor: markColor,
        }}
      />

      {/* Bottom Right Corner */}
      {/* Vertical line: along right edge (x = 0), extending DOWN from y = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          bottom: `-${actualGap + markLength}px`,
          right: `0px`,
          width: `${markThickness}px`,
          height: `${markLength}px`,
          backgroundColor: markColor,
        }}
      />
      {/* Horizontal line: along bottom edge (y = 0), extending RIGHT from x = -gap to -(gap + markLength) */}
      <div
        className="crop-mark"
        style={{
          bottom: `0px`,
          right: `-${actualGap + markLength}px`,
          width: `${markLength}px`,
          height: `${markThickness}px`,
          backgroundColor: markColor,
        }}
      />

      {children}
    </div>
  );
};

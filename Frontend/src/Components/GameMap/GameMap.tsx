// src/components/GameMap.tsx
import { useRef, useEffect } from "react";
import type { GameMapProps } from "../types/gameMap.types";
import { useMapControls } from "./GameMapAssets/map.hooks/useMapControls";
import {
  R,
  hexWidth,
  horizontalOffset,
  verticalOverlap,
} from "./GameMapAssets/map.utils/getHexFromScreen";
import { gameTile } from "./GameMapAssets/map.utils/gameTile";
import { COLORS } from "./GameMapAssets/map.utils/gameTileColors";

const GameMap = ({ size, moveTo }: GameMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [columns, rows] = size.split("*").map(Number) as [number, number];

  // ⚡ Load our abstracted controller engine hook (Now extracting jumpToHex)
  const { transform, dimensions, hoveredHex, jumpToHex, handlers } =
    useMapControls(canvasRef, rows, columns);

  // 🎯 CAMERA MOVEMENT TRIGGER
  // Listens for 'moveTo' changes and commands the hook to center the viewport
  useEffect(() => {
    if (!moveTo) return;

    // Correctly split the "row,col" coordinate string into separate numbers
    const [targetRow, targetCol] = moveTo.map(Number);

    if (!isNaN(targetRow) && !isNaN(targetCol)) {
      jumpToHex(targetRow, targetCol);
    }
  }, [moveTo, jumpToHex]);

  // Core Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const startCol = Math.max(
      0,
      Math.floor(
        (-transform.x / transform.scale - hexWidth) / horizontalOffset,
      ),
    );
    const endCol = Math.min(
      columns,
      Math.ceil(
        ((-transform.x + dimensions.width) / transform.scale + hexWidth) /
          horizontalOffset,
      ),
    );

    const startRow = Math.max(
      0,
      Math.floor((-transform.y / transform.scale - R * 2) / verticalOverlap),
    );
    const endRow = Math.min(
      rows,
      Math.ceil(
        ((-transform.y + dimensions.height) / transform.scale + R * 2) /
          verticalOverlap,
      ),
    );

    for (let r = startRow; r < endRow; r++) {
      const isOddRow = r % 2 !== 0;
      const rowXOffset = isOddRow ? hexWidth / 2 : 0;

      for (let c = startCol; c < endCol; c++) {
        const centerX = c * horizontalOffset + rowXOffset + hexWidth / 2;
        const centerY = r * verticalOverlap + R;

        const isHovered =
          hoveredHex !== null && hoveredHex.row === r && hoveredHex.col === c;

        gameTile(
          ctx,
          centerX,
          centerY,
          R,
          r,
          c,
          transform.scale,
          COLORS,
          isHovered,
        );
      }
    }

    ctx.restore();
  }, [transform, dimensions, columns, rows, hoveredHex]);

  return (
    <div className="w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block touch-none cursor-grab active:cursor-grabbing"
        {...handlers} // Mixes down all pointer, swipe, and gesture events smoothly
      />
    </div>
  );
};

export default GameMap;

// src/components/GameMap.tsx
import { useRef, useEffect } from "react";
import type { GameMapProps, TerrainType } from "../types/gameMap.types";
import { useMapControls } from "./GameMapAssets/map.hooks/useMapControls";
import {
  R,
  hexWidth,
  horizontalOffset,
  verticalOverlap,
} from "./GameMapAssets/map.utils/getHexFromScreen";
import { gameTile } from "./GameMapAssets/map.utils/gameTile";

const GameMap = ({ size, moveTo, mapData = {}, onTileClick }: GameMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [columns, rows] = size.split("*").map(Number) as [number, number];

  // Pass onTileClick into the hook!
  const { transform, dimensions, hoveredHex, jumpToHex, handlers } =
    useMapControls(canvasRef, rows, columns, onTileClick);

  useEffect(() => {
    if (!moveTo) return;
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

    const startCol = Math.max(0, Math.floor((-transform.x / transform.scale - hexWidth) / horizontalOffset));
    const endCol = Math.min(columns, Math.ceil(((-transform.x + dimensions.width) / transform.scale + hexWidth) / horizontalOffset));
    const startRow = Math.max(0, Math.floor((-transform.y / transform.scale - R * 2) / verticalOverlap));
    const endRow = Math.min(rows, Math.ceil(((-transform.y + dimensions.height) / transform.scale + R * 2) / verticalOverlap));

    for (let r = startRow; r < endRow; r++) {
      const isOddRow = r % 2 !== 0;
      const rowXOffset = isOddRow ? hexWidth / 2 : 0;

      for (let c = startCol; c < endCol; c++) {
        const centerX = c * horizontalOffset + rowXOffset + hexWidth / 2;
        const centerY = r * verticalOverlap + R;

        const isHovered = hoveredHex !== null && hoveredHex.row === r && hoveredHex.col === c;
        const currentTerrain: TerrainType = mapData[`${r},${c}`] || "empty";

        gameTile(ctx, centerX, centerY, R, r, c, transform.scale, isHovered, currentTerrain);
      }
    }

    ctx.restore();
  }, [transform, dimensions, columns, rows, hoveredHex, mapData]);

  return (
    <div className="w-full h-full overflow-hidden select-none relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block touch-none cursor-grab active:cursor-grabbing"
        {...handlers}
      />

      {/* 🎯 FLOATING TOOLTIP OVERLAY */}
      {hoveredHex && hoveredHex.x !== undefined && hoveredHex.y !== undefined && (
        <div
          className="absolute z-50 pointer-events-none transition-opacity duration-150"
          style={{
            left: hoveredHex.x + 15,
            top: hoveredHex.y - 45,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 text-white px-3 py-2 rounded-lg shadow-xl text-sm flex flex-col gap-1 min-w-[140px]">
            <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1">
              <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Coordinates</span>
              <span className="font-mono text-emerald-400 text-xs">[{hoveredHex.row}, {hoveredHex.col}]</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Terrain:</span>
              <span className="capitalize font-medium text-white text-sm">
                {mapData[`${hoveredHex.row},${hoveredHex.col}`] || "Empty"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap;
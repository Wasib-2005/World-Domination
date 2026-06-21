import type { TerrainType } from "../../../types/gameMap.types";
import { getCachedTile } from "./terrain/terrainAssets/tileCache";

export const gameTile = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  row: number,
  col: number,
  scale: number,
  isHovered: boolean,
  terrain?: TerrainType,
): void => {
  const sprite = getCachedTile(terrain ?? "empty", row, col, radius, isHovered);
  const size = sprite.width;
  ctx.drawImage(ctx === ctx ? sprite : sprite, centerX - size / 2, centerY - size / 2, size, size);

  if (isHovered && scale > 0.5) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${row + 1},${col + 1}`, centerX, centerY - radius * 0.55 + 14);
  }
};
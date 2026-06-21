import type { TerrainType } from "../../../../../types/gameMap.types";
import { drawTerrainTile } from "./terrainRenderer";


const cache = new Map<string, HTMLCanvasElement>();

// Cache key: terrain + radius + hover state + a coarse row/col bucket for texture variety
// We don't need true per-tile uniqueness in the cache — bucket row/col into a small repeating
// pattern (e.g. 8x8) so we get visual variety without infinite cache entries.
const VARIANT_BUCKET = 8;

export const getCachedTile = (
  terrain: TerrainType,
  row: number,
  col: number,
  radius: number,
  isHovered: boolean,
): HTMLCanvasElement => {
  const variantRow = row % VARIANT_BUCKET;
  const variantCol = col % VARIANT_BUCKET;
  const key = `${terrain}-${radius}-${isHovered}-${variantRow}-${variantCol}`;

  let tile = cache.get(key);
  if (tile) return tile;

  const size = radius * 2.2; // padding for stroke/glow
  tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const ctx = tile.getContext("2d")!;

  drawTerrainTile(ctx, size / 2, size / 2, radius, variantRow, variantCol, isHovered, terrain);

  cache.set(key, tile);
  return tile;
};
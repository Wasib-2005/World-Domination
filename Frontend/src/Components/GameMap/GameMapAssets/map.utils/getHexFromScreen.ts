import type {
  HexCoord,
  Transform,
} from "../../../types/gameMap.types";
export const R = 45;
export const hexWidth = Math.sqrt(3) * R;
export const horizontalOffset = hexWidth;
export const verticalOverlap = 1.5 * R;



export const getHexFromScreen = (
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  transform: Transform,
  rows: number,
  columns: number,
): HexCoord | null => {
  const rect = canvas.getBoundingClientRect();
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;

  const worldX = (screenX - transform.x) / transform.scale;
  const worldY = (screenY - transform.y) / transform.scale;

  const approxRow = Math.round((worldY - R) / verticalOverlap);

  let closestTile: HexCoord | null = null;
  let minDistance = Infinity;

  for (let r = approxRow - 1; r <= approxRow + 1; r++) {
    if (r < 0 || r >= rows) continue;

    const isOddRow = r % 2 !== 0;
    const rowXOffset = isOddRow ? hexWidth / 2 : 0;
    const approxCol = Math.floor((worldX - rowXOffset) / horizontalOffset);

    for (let c = approxCol - 1; c <= approxCol + 1; c++) {
      if (c < 0 || c >= columns) continue;

      const centerX = c * horizontalOffset + rowXOffset + hexWidth / 2;
      const centerY = r * verticalOverlap + R;

      const distance = Math.hypot(worldX - centerX, worldY - centerY);
      if (distance < minDistance) {
        minDistance = distance;
        closestTile = { row: r, col: c };
      }
    }
  }

  return closestTile && minDistance <= R ? closestTile : null;
};

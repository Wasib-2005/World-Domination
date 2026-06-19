import type { GameMapColors } from "../../../types/gameMap.types";

export const gameTile = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  row: number,
  col: number,
  scale: number,
  colors: GameMapColors,
  isHovered: boolean,
): void => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.fillStyle = isHovered ? colors.hoverTileFill : colors.tileFill;
  ctx.fill();

  ctx.strokeStyle = isHovered ? colors.hoverTileBorder : colors.tileBorder;
  ctx.lineWidth = isHovered ? 3.0 : 2;
  ctx.stroke();

  if (scale > 0.4) {
    ctx.fillStyle = colors.text;
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(`R:${row + 1} C:${col + 1}`, centerX, centerY - 6);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("dfsadfasd", centerX, centerY + 6);
  }
};
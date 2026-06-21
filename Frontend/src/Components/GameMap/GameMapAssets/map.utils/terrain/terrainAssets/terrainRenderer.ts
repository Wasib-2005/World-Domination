import type { TerrainColors } from "../../../../../types/gameMap.types";
import { getTerrainColors } from "../terrainIndex";

const hexPath = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
  }
  ctx.closePath();
};

const seededRandom = (row: number, col: number, salt: number) => {
  const x = Math.sin(row * 374761393 + col * 668265263 + salt * 97) * 43758.5453;
  return x - Math.floor(x);
};

const drawDetail = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  row: number,
  col: number,
  colors: TerrainColors,
) => {
  const { texture, density = 6, minSize = 1, maxSize = 2, detail } = colors;

  ctx.save();
  hexPath(ctx, centerX, centerY, radius);
  ctx.clip();
  ctx.strokeStyle = detail;
  ctx.fillStyle = detail;

  switch (texture) {
    case "waves": {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < density; i++) {
        const wobble = (seededRandom(row, col, i + 10) - 0.5) * 6;
        const y = centerY + (i - (density - 1) / 2) * (radius * 0.9 / density) + wobble;
        ctx.beginPath();
        ctx.moveTo(centerX - radius, y);
        ctx.quadraticCurveTo(centerX - radius * 0.5, y - 5, centerX, y);
        ctx.quadraticCurveTo(centerX + radius * 0.5, y + 5, centerX + radius, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 3; i++) {
        const dx = (seededRandom(row, col, i + 20) - 0.5) * radius * 1.2;
        const dy = (seededRandom(row, col, i + 30) - 0.5) * radius * 1.2;
        ctx.beginPath();
        ctx.arc(centerX + dx, centerY + dy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "dots": {
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < density; i++) {
        const dx = (seededRandom(row, col, i + 1) - 0.5) * radius * 1.5;
        const dy = (seededRandom(row, col, i + 200) - 0.5) * radius * 1.5;
        const r = minSize + seededRandom(row, col, i + 400) * (maxSize - minSize);
        ctx.beginPath();
        ctx.arc(centerX + dx, centerY + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "trees": {
      for (let i = 0; i < density; i++) {
        const dx = (seededRandom(row, col, i + 100) - 0.5) * radius * 1.5;
        const dy = (seededRandom(row, col, i + 110) - 0.5) * radius * 1.5;
        // keep trees roughly inside hex bounds
        if (Math.hypot(dx, dy) > radius * 0.85) continue;
        const size = minSize + seededRandom(row, col, i + 120) * (maxSize - minSize);
        const tx = centerX + dx;
        const ty = centerY + dy;
        ctx.globalAlpha = 0.5 + seededRandom(row, col, i + 130) * 0.3;
        ctx.beginPath();
        ctx.moveTo(tx, ty - size);
        ctx.lineTo(tx - size * 0.65, ty + size * 0.5);
        ctx.lineTo(tx + size * 0.65, ty + size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(tx - 0.6, ty + size * 0.5, 1.2, size * 0.35);
      }
      break;
    }

    case "hatch":
    default: {
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1;
      const span = density;
      for (let i = -span; i <= span; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX - radius + i * 8, centerY - radius);
        ctx.lineTo(centerX + radius + i * 8, centerY + radius);
        ctx.stroke();
      }
      break;
    }
  }

  ctx.restore();
};

export const drawTerrainTile = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  row: number,
  col: number,
  isHovered: boolean,
  terrain: Parameters<typeof getTerrainColors>[0] = "empty",
): void => {
  const colors = getTerrainColors(terrain);

  if (isHovered) {
    ctx.save();
    ctx.shadowColor = colors.hoverBorder;
    ctx.shadowBlur = 14;
    hexPath(ctx, centerX, centerY, radius);
    ctx.fillStyle = colors.hoverFill;
    ctx.fill();
    ctx.restore();
  }

  const gradient = ctx.createRadialGradient(
    centerX, centerY - radius * 0.3, radius * 0.1,
    centerX, centerY, radius,
  );
  const baseFill = isHovered ? colors.hoverFill : colors.fill;
  gradient.addColorStop(0, lighten(baseFill, isHovered ? 14 : 8));
  gradient.addColorStop(1, baseFill);

  hexPath(ctx, centerX, centerY, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  drawDetail(ctx, centerX, centerY, radius, row, col, colors);

  hexPath(ctx, centerX, centerY, radius);
  ctx.strokeStyle = isHovered ? colors.hoverBorder : colors.border;
  ctx.lineWidth = isHovered ? 2.5 : 1.2;
  ctx.stroke();

  ctx.save();
  hexPath(ctx, centerX, centerY, radius);
  ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.55);
  ctx.lineTo(centerX + radius * 0.7, centerY - radius * 0.55);
  ctx.stroke();
  ctx.restore();
};

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round((255 * percent) / 100);
  let g = ((num >> 8) & 0x00ff) + Math.round((255 * percent) / 100);
  let b = (num & 0x0000ff) + Math.round((255 * percent) / 100);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `rgb(${r},${g},${b})`;
}
// types/gameMap.types.ts
export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface HexCoord {
  row: number;
  col: number;
}

export interface GameMapColors {
  tileFill: string;
  tileBorder: string;
  // hover
  hoverTileFill: string;
  hoverTileBorder: string;

  text: string;
}

export interface GameMapProps {
  size: string; // format: "rows*cols", e.g. "1000*1000"
  moveTo?: [number?, number?]; // format: "x,y", e.g "500,500"
}

export interface GameTileProps {
  row: number;
  col: number;
  width: number;
  height: number;
}

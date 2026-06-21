export type TerrainType = "empty" | "sand" | "water" | "beach" | "forest";

export type TextureKind = "waves" | "dots" | "trees" | "hatch";

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
  x?: number;
  y?: number;
}

export interface TerrainColors {
  fill: string;
  border: string;
  hoverFill: string;
  hoverBorder: string;
  text: string;
  detail: string;
  texture: TextureKind;
  density?: number;   // how many texture elements (dots/trees) per tile
  minSize?: number;   // min size of each texture element
  maxSize?: number;   // max size of each texture element
}

export interface GameMapProps {
  size: string;
  moveTo?: [number?, number?];
  mapData?: Record<string, TerrainType>;
  onTileClick?: (row: number, col: number) => void;
}



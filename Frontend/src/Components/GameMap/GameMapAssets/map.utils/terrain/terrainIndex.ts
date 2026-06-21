import type { TerrainColors, TerrainType } from "../../../../types/gameMap.types";
import { defaultTerrain } from "./terrainAssets/defaultTerrain";
import { sand } from "./terrainAssets/sand";
import { water } from "./terrainAssets/water";
import { beach } from "./terrainAssets/beach";
import { forest } from "./terrainAssets/forest";

export const getTerrainColors = (terrain: TerrainType): TerrainColors => {
  switch (terrain) {
    case "sand":
      return sand;
    case "water":
      return water;
    case "beach":
      return beach;
    case "forest":
      return forest;
    case "empty":
    default:
      return defaultTerrain;
  }
};
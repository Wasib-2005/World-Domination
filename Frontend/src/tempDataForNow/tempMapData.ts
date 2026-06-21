// src/data/tempMapData.ts
import type { TerrainType } from "../Components/types/gameMap.types";

export const tempMapData: Record<string, TerrainType> = {};

// 🌍 Generate a massive, proportional test island centered around row 500, col 500
const generateIsland = () => {
  const centerRow = 1000;
  const centerCol = 1000;
  const maxRadius = 150; // 🎯 This is a great size for testing rendering performance!

  for (let r = centerRow - maxRadius; r <= centerRow + maxRadius; r++) {
    for (let c = centerCol - maxRadius; c <= centerCol + maxRadius; c++) {
      // Calculate distance from the island center
      const distance = Math.hypot(r - centerRow, c - centerCol);
      const key = `${r},${c}`;

      if (distance < maxRadius) {
        // ⚡ FIX: Use percentages of maxRadius so everything grows proportionally!
        const ratio = distance / maxRadius;

        if (ratio < 0.35) {
          // Central core (Inner 35% of the island)
          tempMapData[key] = "forest";
        } else if (ratio < 0.75) {
          // Main ring (Up to 75%)
          tempMapData[key] = "sand";
        } else if (ratio < 0.90) {
          // Outer coastal ring (Up to 90%)
          tempMapData[key] = "beach";
        } else {
          // Shallow coast/shallows (Outer 10%)
          tempMapData[key] = "water";
        }
      } else {
        // Outlying open ocean surrounding the island
        if (distance < maxRadius + 15) {
          tempMapData[key] = "water";
        }
      }
    }
  }
};

// Execute the generator immediately on file load
generateIsland();
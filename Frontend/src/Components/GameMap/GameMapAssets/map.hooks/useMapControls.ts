// src/hooks/useMapControls.ts
import { useState, useRef, useEffect, useCallback } from "react";
import type {
  Transform,
  Dimensions,
  HexCoord,
} from "../../../types/gameMap.types";
import {
  getHexFromScreen,
  R,
  hexWidth,
  horizontalOffset,
  verticalOverlap,
} from "../map.utils/getHexFromScreen";

const MIN_SCALE = 0.15;
const MAX_SCALE = 3.0;

export const useMapControls = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  rows: number,
  columns: number,
  onTileClick?: (row: number, col: number) => void,
) => {
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 0.8,
  });
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 800,
    height: 600,
  });
  const [hoveredHex, setHoveredHex] = useState<HexCoord | null>(null);

  const isDragging = useRef<boolean>(false);
  const totalDragDist = useRef<number>(0);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDist = useRef<number>(0);
  
  // ⚡ Bulletproof timer for mobile long-press tooltips
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resize Window
  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wheel Zoom Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;

      setTransform((prev) => {
        let newScale = prev.scale * zoomFactor;
        if (newScale < MIN_SCALE) newScale = MIN_SCALE;
        if (newScale > MAX_SCALE) newScale = MAX_SCALE;
        if (newScale === prev.scale) return prev;

        const ratio = newScale / prev.scale;
        return {
          x: mouseX - (mouseX - prev.x) * ratio,
          y: mouseY - (mouseY - prev.y) * ratio,
          scale: newScale,
        };
      });
    };

    canvas.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheelNative);
  }, [canvasRef]);

  const resolveTargetHex = useCallback(
    (clientX: number, clientY: number): HexCoord | null => {
      if (!canvasRef.current) return null;
      return getHexFromScreen(clientX, clientY, canvasRef.current, transform, rows, columns);
    },
    [transform, rows, columns, canvasRef],
  );

  const handleCanvasClick = (clientX: number, clientY: number) => {
    const closestTile = resolveTargetHex(clientX, clientY);
    if (closestTile) {
      console.log(`🎯 Clicked Canvas Hex -> Row: ${closestTile.row + 1}, Col: ${closestTile.col + 1}`);
      if (onTileClick) {
        onTileClick(closestTile.row, closestTile.col);
      }
    }
  };

  // --- INTERACTION EVENTS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    totalDragDist.current = 0;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    setHoveredHex(null); // Hide tooltip when clicking
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastPointerPos.current.x;
      const deltaY = e.clientY - lastPointerPos.current.y;
      totalDragDist.current += Math.hypot(deltaX, deltaY);
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      setTransform((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setHoveredHex(null); // Hide tooltip while panning
    } else {
      const currentTile = resolveTargetHex(e.clientX, e.clientY);
      const isDifferent =
        (!currentTile && hoveredHex !== null) ||
        (currentTile && (!hoveredHex || hoveredHex.row !== currentTile.row || hoveredHex.col !== currentTile.col));

      // Update state with tile data AND pointer position for the tooltip
      if (isDifferent) {
        setHoveredHex(currentTile ? { ...currentTile, x: e.clientX, y: e.clientY } : null);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (totalDragDist.current < 6) {
      handleCanvasClick(e.clientX, e.clientY);
    }
    
    const tile = resolveTargetHex(e.clientX, e.clientY);
    setHoveredHex(tile ? { ...tile, x: e.clientX, y: e.clientY } : null);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseUp(e);
    setHoveredHex(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setHoveredHex(null);
    if (e.touches.length === 1) {
      isDragging.current = true;
      totalDragDist.current = 0;
      const touch = e.touches[0];
      lastPointerPos.current = { x: touch.clientX, y: touch.clientY };

      // ⚡ Mobile Tooltip Timer (Long press for 400ms)
      longPressTimer.current = setTimeout(() => {
        if (totalDragDist.current < 10) {
          const tile = resolveTargetHex(touch.clientX, touch.clientY);
          if (tile) {
            setHoveredHex({ ...tile, x: touch.clientX, y: touch.clientY });
            if (typeof navigator.vibrate === "function") navigator.vibrate(50);
          }
        }
      }, 400);
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastTouchDist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      lastPointerPos.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Cancel long press if the user drags their finger
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    if (e.touches.length === 1 && isDragging.current) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPointerPos.current.x;
      const deltaY = touch.clientY - lastPointerPos.current.y;
      totalDragDist.current += Math.hypot(deltaX, deltaY);
      lastPointerPos.current = { x: touch.clientX, y: touch.clientY };

      setTransform((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    } else if (e.touches.length === 2) {
      // ... your standard zoom math
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      if (lastTouchDist.current > 0) {
        const zoomFactor = currentDist / lastTouchDist.current;
        setTransform((prev) => {
          let newScale = prev.scale * zoomFactor;
          if (newScale < MIN_SCALE) newScale = MIN_SCALE;
          if (newScale > MAX_SCALE) newScale = MAX_SCALE;
          if (newScale === prev.scale) return prev;

          const ratio = newScale / prev.scale;
          return {
            x: midX - (midX - prev.x) * ratio,
            y: midY - (midY - prev.y) * ratio,
            scale: newScale,
          };
        });
      }
      lastTouchDist.current = currentDist;
      lastPointerPos.current = { x: midX, y: midY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    if (isDragging.current && totalDragDist.current < 6 && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      handleCanvasClick(touch.clientX, touch.clientY);
    }
    isDragging.current = false;
    lastTouchDist.current = 0;

    // Fade tooltip out after lifting finger on mobile
    setTimeout(() => setHoveredHex(null), 1500);
  };

  const jumpToHex = useCallback(
    (row: number, col: number) => {
      if (row < 0 || row >= rows || col < 0 || col >= columns) return;

      const isOddRow = row % 2 !== 0;
      const rowXOffset = isOddRow ? hexWidth / 2 : 0;
      const worldX = col * horizontalOffset + rowXOffset + hexWidth / 2;
      const worldY = row * verticalOverlap + R;

      setTransform((prev) => ({
        ...prev,
        x: dimensions.width / 2 - worldX * prev.scale,
        y: dimensions.height / 2 - worldY * prev.scale,
      }));
    },
    [dimensions.width, dimensions.height, rows, columns],
  );

  return {
    transform,
    dimensions,
    hoveredHex,
    jumpToHex,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
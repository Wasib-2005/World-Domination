// src/Pages/GameLayout.tsx
import React, { useState, useEffect, useRef } from "react";
import GameMap from "../Components/GameMap/GameMap";
import type { TerrainType } from "../Components/types/gameMap.types";

import SocketCheckInputTest from "./socketCheckInputTest";
import { tempMapData } from "../tempDataForNow/tempMapData";

const TERRAIN_CYCLE: TerrainType[] = ["empty", "sand", "beach", "forest", "water"];

const GameLayout: React.FC = () => {
  const [inputRow, setInputRow] = useState<string>("");
  const [inputCol, setInputCol] = useState<string>("");
  const [moveToTarget, setMoveToTarget] = useState<[number?, number?] | undefined>(undefined);
  const [mapData, setMapData] = useState<Record<string, TerrainType>>(tempMapData);
  
  // ⚡ Add state to display what other devices type into the input field
  const [liveText, setLiveText] = useState<string>("");

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("wss://world-domination-backend-production.up.railway.app");
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // 🎯 Route 1: Handle incoming map edits
        if (message.type === "TILE_UPDATE") {
          const { row, col, terrain } = message.payload;
          setMapData((prevData) => ({
            ...prevData,
            [`${row},${col}`]: terrain,
          }));
        }
        
        // 🎯 Route 2: Handle incoming live input text updates
        if (message.type === "INPUT_TEXT") {
          setLiveText(message.payload.text);
        }
      } catch (err) {
        console.error("Failed to parse incoming socket data stream:", err);
      }
    };

    return () => socket.close();
  }, []);

  const handleTileClick = (row: number, col: number) => {
    let nextTerrain: TerrainType = "empty";
    setMapData((prevData) => {
      const key = `${row},${col}`;
      const currentTerrain = prevData[key] || "empty";
      const currentIndex = TERRAIN_CYCLE.indexOf(currentTerrain);
      nextTerrain = TERRAIN_CYCLE[(currentIndex + 1) % TERRAIN_CYCLE.length];
      return { ...prevData, [key]: nextTerrain };
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "TILE_UPDATE",
          payload: { row, col, terrain: nextTerrain },
        })
      );
    }
  };

  // ⚡ This function takes typed text and sends it out through your active WebSocket pipeline
  const sendInputOverSocket = (text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "INPUT_TEXT",
          payload: { text }
        })
      );
    }
  };

  const handleJumpToTile = () => {
    const r = parseInt(inputRow, 10);
    const c = parseInt(inputCol, 10);
    if (!isNaN(r) && !isNaN(c)) {
      setMoveToTarget([r, c]);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 select-none relative">
      {/* ⚡ Pass the sending callback and the receiving text state down as props */}
      <SocketCheckInputTest 
        onInputChange={sendInputOverSocket} 
        receivedText={liveText} 
      />
      
      {/* 🛠️ Map Navigation & Jump Controls Panel */}
      <div className="absolute top-4 left-4 z-50 bg-slate-800/90 p-4 rounded-lg border border-slate-700 flex flex-col gap-3 shadow-xl backdrop-blur-sm max-w-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setMoveToTarget([0, 0])}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition flex-1"
          >
            📍 Center [0, 0]
          </button>
          <button
            onClick={() => setMoveToTarget([2000, 1000])}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition flex-1"
          >
            📍 Center [2000, 1000]
          </button>
        </div>

        <hr className="border-slate-700" />

        {/* 🚀 Jump inputs setup */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-xs font-medium">Jump to Coordinates:</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Row"
              value={inputRow}
              onChange={(e) => setInputRow(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="Col"
              value={inputCol}
              onChange={(e) => setInputCol(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleJumpToTile}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-1.5 rounded transition mt-1"
          >
            ⚡ Jump to Tile
          </button>
        </div>
      </div>

      <GameMap
        size="100000*100000"
        moveTo={moveToTarget}
        mapData={mapData}
        onTileClick={handleTileClick}
      />
    </div>
  );
};

export default GameLayout;
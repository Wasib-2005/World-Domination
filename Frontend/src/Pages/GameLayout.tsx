// src/Pages/GameLayout.tsx
import React, { useState } from "react";
import GameMap from "../Components/GameMap/GameMap";

const GameLayout: React.FC = () => {
  const [inputRow, setInputRow] = useState<string>("");
  const [inputCol, setInputCol] = useState<string>("");
  
  // 🎯 Matches your custom types/gameMap.types.ts definition
  const [moveToTarget, setMoveToTarget] = useState<[number?, number?] | undefined>(undefined);

  const handleJumpToTile = () => {
    const r = parseInt(inputRow, 10);
    const c = parseInt(inputCol, 10);
    
    if (!isNaN(r) && !isNaN(c)) {
      // 🎯 Directly feed the numeric tuple array
      setMoveToTarget([r, c]);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 select-none relative">
      
      <div className="fixed z-50 bg-white/90 backdrop-blur p-4 rounded-xl shadow-2xl top-6 left-6 flex gap-2 items-center border border-slate-200">
        <input 
          type="number" 
          placeholder="Row" 
          value={inputRow}
          className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
          onChange={(e) => setInputRow(e.target.value)} 
        />
        <input 
          type="number" 
          placeholder="Col" 
          value={inputCol}
          className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
          onChange={(e) => setInputCol(e.target.value)} 
        />
        <button
          onClick={handleJumpToTile}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          Jump
        </button>
      </div>

      {/* 🎯 Beautifully matching your custom tuple types */}
      <GameMap size="10000*10000" moveTo={moveToTarget} />
    </div>
  );
};

export default GameLayout;
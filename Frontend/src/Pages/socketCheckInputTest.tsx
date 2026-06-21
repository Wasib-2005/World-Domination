// src/Pages/SocketCheckInputTest.tsx
import React from "react";

interface SocketInputProps {
  onInputChange: (text: string) => void;
  receivedText: string;
}

const SocketCheckInputTest: React.FC<SocketInputProps> = ({ onInputChange, receivedText }) => {
  const socketCheckInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textValue = e.target.value;
    console.log("Local Typing:", textValue);
    
    // Trigger the callback function provided by the parent layout
    onInputChange(textValue);
  };

  return (
    <div className=" fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-2 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-2xl">
      {/* 📥 Displays what OTHER devices send via socket */}
      <p className="text-emerald-400 font-mono text-sm">
        Output data: <span className="text-white">{receivedText || "(waiting...)"}</span>
      </p>
      
      <input
        type="text"
        placeholder="Socket test input..."
        className="bg-white text-black px-3 py-2 rounded border border-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 text-sm w-64"
        onChange={socketCheckInput}
      />
    </div>
  );
};

export default SocketCheckInputTest;
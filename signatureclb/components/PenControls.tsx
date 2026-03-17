// components/PenControls.tsx
'use client';

import React from 'react';
import { Settings } from 'lucide-react';

interface PenControlsProps {
  penColor: string;
  setPenColor: (color: string) => void;
  penSize: number;
  setPenSize: (size: number) => void;
  isDarkMode: boolean;
}

const COLOR_PALETTE = [
  { color: '#000000', name: 'Black' },
  { color: '#FF0000', name: 'Red' },
  { color: '#0066FF', name: 'Blue' },
  { color: '#00AA00', name: 'Green' },
  { color: '#FF9900', name: 'Orange' },
  { color: '#9900FF', name: 'Purple' },
  { color: '#00CCCC', name: 'Cyan' },
  { color: '#FF0099', name: 'Pink' },
];

export const PenControls: React.FC<PenControlsProps> = ({
  penColor,
  setPenColor,
  penSize,
  setPenSize,
  isDarkMode,
}) => {
  return (
    <div
      className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } rounded-lg border p-5 space-y-5`}
    >
      <h3 className="font-bold flex items-center gap-2 text-lg">
        <Settings size={20} /> Pen Settings
      </h3>

      {/* Color Picker */}
      <div>
        <label className="text-sm font-semibold block mb-3">Color Palette</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTE.map((item) => (
            <button
              key={item.color}
              onClick={() => setPenColor(item.color)}
              className="relative group"
              title={item.name}
            >
              <div
                className="w-10 h-10 rounded-lg transition transform hover:scale-110"
                style={{ backgroundColor: item.color }}
              />
              {penColor === item.color && (
                <div
                  className="absolute inset-0 rounded-lg ring-2 ring-white"
                  style={{
                    boxShadow: `0 0 0 3px ${isDarkMode ? '#64748b' : '#e5e7eb'}`,
                  }}
                />
              )}
              <span
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none ${
                  isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-800 text-white'
                }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Slider */}
      <div>
        <label className="text-sm font-semibold block mb-3">
          Pen Size: <span className="text-blue-600">{penSize}px</span>
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={penSize}
          onChange={(e) => setPenSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Thin</span>
          <span>Thick</span>
        </div>
      </div>

      {/* Preview */}
      <div className={`p-3 rounded border ${isDarkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-gray-100'}`}>
        <p className="text-xs font-medium mb-2">Preview:</p>
        <svg width="100%" height="40" className={isDarkMode ? 'bg-slate-800' : 'bg-white'} style={{borderRadius: '4px'}}>
          <line x1="10" y1="20" x2="90%" y2="20" stroke={penColor} strokeWidth={penSize} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

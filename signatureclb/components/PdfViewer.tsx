// components/PdfViewer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

interface Signature {
  x: number;
  y: number;
  image: string;
  id: string;
  timestamp: string;
  userId?: string;
  penColor?: string;
  penSize?: number;
}

interface PdfViewerProps {
  pdfUrl: string | null;
  signatures: Signature[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPdfClick: (e: React.MouseEvent) => void;
  isDarkMode: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  signatures,
  zoom,
  onZoomChange,
  onPdfClick,
  isDarkMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const handleZoom = (direction: 'in' | 'out') => {
    const step = 0.1;
    const newZoom = direction === 'in' ? zoom + step : Math.max(0.5, zoom - step);
    onZoomChange(newZoom);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!pdfUrl) {
    return (
      <div
        className={`${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } rounded-xl border-2 border-dashed p-12 text-center cursor-pointer hover:border-blue-500 transition`}
      >
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold mb-2">No PDF Selected</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          Upload a PDF file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div
        className={`${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } rounded-lg border p-4 flex gap-4 items-center flex-wrap`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom('out')}
            className={`p-2 rounded transition ${
              isDarkMode
                ? 'hover:bg-slate-700'
                : 'hover:bg-gray-100'
            }`}
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-200 dark:bg-slate-700">
            <span className="text-sm font-medium min-w-12">
              {(zoom * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>

          <button
            onClick={() => handleZoom('in')}
            className={`p-2 rounded transition ${
              isDarkMode
                ? 'hover:bg-slate-700'
                : 'hover:bg-gray-100'
            }`}
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={handleRotate}
            className={`p-2 rounded transition flex items-center gap-2 ${
              isDarkMode
                ? 'hover:bg-slate-700'
                : 'hover:bg-gray-100'
            }`}
            title="Rotate"
          >
            <RotateCw size={18} /> {rotation}°
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded ${
              isDarkMode
                ? 'bg-blue-900 text-blue-200'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {signatures.length} signatures
          </span>
        </div>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className={`${
          isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
        } rounded-lg shadow-xl overflow-auto border-2 border-gray-300 relative cursor-crosshair`}
        onClick={onPdfClick}
        style={{
          height: '700px',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
          className={isDarkMode ? 'bg-slate-700' : 'bg-white'}
        >
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-screen pointer-events-none"
          >
            <p>PDF Not Supported</p>
          </object>

          {/* Signatures Overlay */}
          {signatures.map((sig) => (
            <div
              key={sig.id}
              className="absolute group"
              style={{
                left: `${(sig.x / 600) * 100}%`,
                top: `${(sig.y / 800) * 100}%`,
                width: '100px',
                height: '50px',
              }}
            >
              <img
                src={sig.image}
                alt="signature"
                className="w-full h-full drop-shadow-lg hover:drop-shadow-xl object-contain cursor-pointer hover:scale-110 transition-transform"
              />
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none font-medium ${
                  isDarkMode
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <div>{sig.userId || 'Anonymous'}</div>
                <div className="text-gray-300">{sig.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p
        className={`text-xs italic ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        💡 Tip: Click anywhere on the PDF to add a signature
      </p>
    </div>
  );
};

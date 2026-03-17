// components/SignatureHistory.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Download, Trash2 } from 'lucide-react';
import { exportSignaturesAsJSON, exportSignaturesAsCSV, getSignatureStats } from '@/lib/signature-utils';

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

interface SignatureHistoryProps {
  signatures: Signature[];
  isDarkMode: boolean;
  onClearAll?: () => void;
}

export const SignatureHistory: React.FC<SignatureHistoryProps> = ({
  signatures,
  isDarkMode,
  onClearAll,
}) => {
  const [expanded, setExpanded] = useState(false);
  const stats = getSignatureStats(signatures);

  return (
    <div
      className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } rounded-lg border p-4 space-y-3`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between font-bold text-lg"
      >
        <span>📝 History ({signatures.length})</span>
        <ChevronDown
          size={20}
          className={`transition transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Statistics */}
          {signatures.length > 0 && (
            <div
              className={`p-3 rounded ${
                isDarkMode ? 'bg-slate-700' : 'bg-blue-50 border border-blue-200'
              } text-sm space-y-1`}
            >
              <p>
                <strong>Total Signatures:</strong> {stats.total}
              </p>
              <p>
                <strong>Avg Pen Size:</strong> {stats.avgSignatureSize}px
              </p>
              <p>
                <strong>Most Used Color:</strong>{' '}
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    backgroundColor: stats.mostUsedColor,
                    borderRadius: '2px',
                    marginRight: '4px',
                  }}
                />
                {stats.mostUsedColor}
              </p>
              {Object.keys(stats.byUser).length > 1 && (
                <p>
                  <strong>Contributors:</strong> {Object.keys(stats.byUser).length}
                </p>
              )}
            </div>
          )}

          {/* Signature List */}
          {signatures.length === 0 ? (
            <p
              className={`text-sm text-center py-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              No signatures yet
            </p>
          ) : (
            signatures.map((sig) => (
              <div
                key={sig.id}
                className={`text-xs p-3 rounded border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {sig.userId || 'Anonymous'}
                    </p>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {sig.timestamp}
                    </p>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Position: ({sig.x.toFixed(0)}, {sig.y.toFixed(0)}) •{' '}
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          backgroundColor: sig.penColor || '#000000',
                          borderRadius: '2px',
                          marginRight: '2px',
                        }}
                      />
                      {sig.penSize || 2}px
                    </p>
                  </div>
                  <img
                    src={sig.image}
                    alt="sig-preview"
                    className="w-16 h-8 object-cover rounded"
                  />
                </div>
              </div>
            ))
          )}

          {/* Export Actions */}
          {signatures.length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-gray-300">
              <button
                onClick={() => exportSignaturesAsJSON(signatures)}
                className="flex-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition flex items-center justify-center gap-1"
              >
                <Download size={14} /> JSON
              </button>
              <button
                onClick={() => exportSignaturesAsCSV(signatures)}
                className="flex-1 px-2 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition flex items-center justify-center gap-1"
              >
                <Download size={14} /> CSV
              </button>
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="flex-1 px-2 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

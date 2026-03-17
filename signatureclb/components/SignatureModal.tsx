// components/SignatureModal.tsx
'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: () => void;
  sigPadRef: React.RefObject<any>;
  penColor: string;
  penSize: number;
  isDarkMode: boolean;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSign,
  sigPadRef,
  penColor,
  penSize,
  isDarkMode,
}) => {
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSign = () => {
    if (isEmpty) {
      alert('Please draw your signature first');
      return;
    }
    onSign();
    setIsEmpty(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        } p-6 rounded-xl shadow-2xl border-2 border-blue-500 max-w-2xl w-full mx-4`}
      >
        <h2 className="mb-4 font-bold text-xl flex items-center gap-2">
          ✍️ Sign Here
          <span className="text-sm text-gray-500 font-normal">
            (Draw your signature below)
          </span>
        </h2>

        <div
          className={`border-2 rounded-lg overflow-hidden ${
            isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'
          }`}
        >
          <SignatureCanvas
            ref={sigPadRef}
            penColor={penColor}
            minWidth={penSize}
            maxWidth={penSize}
            canvasProps={{ width: 500, height: 250 }}
            backgroundColor={isDarkMode ? '#1e293b' : '#ffffff'}
            onEnd={() => setIsEmpty(false)}
          />
        </div>

        <p
          className={`text-xs mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Current pen color: <span style={{ color: penColor }}>■ {penColor}</span> | Size: {penSize}px
        </p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-lg transition font-medium ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            disabled={isEmpty}
            className={`flex-1 px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
              isEmpty
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-300 text-gray-500'
                : isDarkMode
                ? 'bg-yellow-700 hover:bg-yellow-600'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            <RotateCcw size={16} /> Clear
          </button>
          <button
            onClick={handleSign}
            disabled={isEmpty}
            className={`flex-1 px-4 py-3 rounded-lg transition font-medium ${
              isEmpty
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            Sign ✓
          </button>
        </div>
      </div>
    </div>
  );
};

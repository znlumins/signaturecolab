// components/Header.tsx
'use client';

import React from 'react';
import { Moon, Sun, Info } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div
        className={`${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } shadow-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex-1 min-w-max">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ✍️ PDF Collab Sign
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Real-time collaborative PDF signature platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition ${
                isDarkMode
                  ? 'hover:bg-slate-700'
                  : 'hover:bg-gray-100'
              }`}
              title="Information"
            >
              <Info size={20} />
            </button>

            <div className="w-px h-8 bg-gray-300"></div>

            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div
            className={`${
              isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'
            } p-6 rounded-xl shadow-2xl max-w-md w-full mx-4`}
          >
            <h2 className="text-2xl font-bold mb-4">About PDF Collab Sign</h2>

            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-bold mb-1">🚀 Features</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Real-time collaborative signing</li>
                  <li>Multi-color & custom pen sizes</li>
                  <li>Zoom & rotate PDF</li>
                  <li>Signature history & export</li>
                  <li>Dark mode support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-1">🎯 How to Use</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Upload a PDF file</li>
                  <li>Click where you want to sign</li>
                  <li>Draw your signature</li>
                  <li>Click Sign to confirm</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold mb-1">📝 Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Customize pen color & size</li>
                  <li>Export signatures as JSON/CSV</li>
                  <li>View real-time collaborators</li>
                  <li>Use undo to remove last signature</li>
                </ul>
              </div>

              <div
                className={`p-3 rounded text-xs ${
                  isDarkMode
                    ? 'bg-slate-700 text-gray-300'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                Made with ❤️ using Next.js, TypeScript & Tailwind CSS
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

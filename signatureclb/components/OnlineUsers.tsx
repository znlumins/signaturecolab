// components/OnlineUsers.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface OnlineUsersProps {
  users: string[];
  isDarkMode: boolean;
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, isDarkMode }) => {
  const [visibleUsers, setVisibleUsers] = useState<string[]>([]);
  const maxVisible = 5;
  const hasMore = users.length > maxVisible;

  useEffect(() => {
    setVisibleUsers(users.slice(0, maxVisible));
  }, [users]);

  return (
    <div
      className={`${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } rounded-lg border p-4 space-y-3`}
    >
      <h3 className="font-bold flex items-center gap-2 text-lg">
        <Users size={20} /> Online Users ({users.length})
      </h3>

      {users.length === 0 ? (
        <p
          className={`text-sm text-center py-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Waiting for others...
        </p>
      ) : (
        <div className="space-y-2">
          {visibleUsers.map((user, idx) => (
            <div
              key={user}
              className="flex items-center gap-2 p-2 rounded"
              style={{
                backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)20`,
              }}
            >
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
                }}
              />
              <span className="text-sm font-medium truncate">{user}</span>
            </div>
          ))}

          {hasMore && (
            <div className="text-xs text-center text-gray-500 pt-2">
              +{users.length - maxVisible} more online
            </div>
          )}
        </div>
      )}

      <div
        className={`text-xs text-center py-2 rounded border ${
          isDarkMode
            ? 'bg-slate-700 border-slate-600 text-gray-300'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        🟢 Real-time Collaboration Active
      </div>
    </div>
  );
};

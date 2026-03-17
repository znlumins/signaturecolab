# Development Guide 👨‍💻

Guide for extending and customizing PDF Collab Sign.

## Project Structure Overview

```
signatureclb/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main application component
│   ├── layout.tsx         # Root layout wrapper
│   ├── globals.css        # Global styles
│   └── api/
│       └── sign/
│           └── route.ts   # Signature API handler
│
├── components/            # Reusable React components
│   ├── Header.tsx        # Navigation & theme
│   ├── PdfViewer.tsx     # PDF viewer with zoom/rotate
│   ├── SignatureModal.tsx  # Modal for drawing signatures
│   ├── PenControls.tsx   # Color & size picker
│   ├── SignatureHistory.tsx # History & export
│   ├── OnlineUsers.tsx   # Collaboration indicator
│   └── index.ts          # Component exports
│
├── lib/                  # Utility functions
│   ├── signature-utils.ts  # Signature helpers (export, validate, etc.)
│   ├── pusher-client.ts   # Real-time communication setup
│   └── types.ts          # TypeScript interfaces
│
├── public/               # Static assets
├── package.json          # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Styling configuration
└── .env.local           # Environment variables
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with server-side rendering
- **React 18** - UI component library
- **TypeScript** - Type-safe programming
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Libraries
- **react-signature-canvas** - Signature drawing
- **pusher-js** - Real-time WebSocket client
- **lucide-react** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Pusher** - Real-time communication service

## Development Workflow

### Start Development Server
```bash
npm run dev
```
- Server runs at http://localhost:3000
- Hot reload enabled (auto-refresh on file changes)
- TypeScript errors shown in terminal

### Build for Production
```bash
npm run build
npm run start
```

### Code Quality
```bash
npm run lint              # Check code quality
npm run lint --fix       # Auto-fix issues
```

## Making Changes

### Adding a New Component

1. **Create component file** in `components/`:
```typescript
// components/MyComponent.tsx
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Click Me</button>
    </div>
  );
};
```

2. **Export from** `components/index.ts`:
```typescript
export { MyComponent } from './MyComponent';
```

3. **Use in app**:
```typescript
import { MyComponent } from '@/components';
```

### Adding a New Hook

Create in `lib/hooks.ts`:
```typescript
import { useState, useCallback } from 'react';

export const useCustomHook = () => {
  const [state, setState] = useState(false);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  return { state, toggle };
};
```

### Adding a New Utility Function

Add to `lib/signature-utils.ts`:
```typescript
export const myNewUtility = (input: string): string => {
  // Implementation
  return input.toUpperCase();
};
```

### Adding a New API Route

Create in `app/api/my-route/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  
  // Process data
  
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  return NextResponse.json({ message: 'Hello' });
}
```

## Styling Guidelines

### Tailwind CSS Usage
Use utility classes consistently:

```typescript
<div className="p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition">
  <h1 className="text-2xl font-bold mb-4">Title</h1>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
    Click
  </button>
</div>
```

### Dark Mode Support
```typescript
<div className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'}`}>
  Content
</div>
```

### Global Styles
Edit `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition;
  }
}
```

## TypeScript Best Practices

### Define Interfaces
```typescript
// lib/types.ts
export interface MyType {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

### Use Type Guards
```typescript
const isSignature = (obj: any): obj is Signature => {
  return 'id' in obj && 'image' in obj;
};
```

### Generics
```typescript
export const getById = <T,>(items: T[], id: string): T | undefined => {
  return items.find((item: any) => item.id === id);
};
```

## State Management

### Use React Hooks
```typescript
const [signatures, setSignatures] = useState<Signature[]>([]);

const addSignature = useCallback((sig: Signature) => {
  setSignatures(prev => [...prev, sig]);
}, []);

const removeSignature = useCallback((id: string) => {
  setSignatures(prev => prev.filter(s => s.id !== id));
}, []);
```

### Context for Global State
Create `app/context/AppContext.tsx`:
```typescript
import React from 'react';
import { Signature } from '@/lib/types';

interface AppContextType {
  signatures: Signature[];
  addSignature: (sig: Signature) => void;
}

export const AppContext = React.createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('Use within provider');
  return ctx;
};
```

## Real-time Features with Pusher

### Subscribe to Events
```typescript
import { subscribeToPdfChannel } from '@/lib/pusher-client';

useEffect(() => {
  const unsubscribe = subscribeToPdfChannel(
    (signature) => {
      console.log('New signature:', signature);
      setSignatures(prev => [...prev, signature]);
    },
    (user) => {
      console.log('User online:', user);
    },
    () => {
      console.log('Signatures cleared');
    }
  );

  return unsubscribe;
}, []);
```

### Trigger Events
```typescript
const sendSignature = async (signature: Signature) => {
  const response = await fetch('/api/sign', {
    method: 'POST',
    body: JSON.stringify(signature),
  });
  return response.json();
};
```

## Performance Optimization

### Memoization
```typescript
const MemoComponent = React.memo(({ data }: Props) => (
  <div>{data}</div>
));

const expensiveFunction = useCallback(() => {
  // Heavy computation
}, [dependency]);
```

### Code Splitting
```typescript
const Modal = dynamic(() => import('@/components/Modal'), {
  loading: () => <Loading />
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image src="/signature.jpg" alt="sig" width={100} height={50} />
```

## Testing

### Add Vitest/Jest
```bash
npm install -D vitest @testing-library/react
```

### Test Example
```typescript
// lib/signature-utils.test.ts
import { describe, it, expect } from 'vitest';
import { validateSignature } from './signature-utils';

describe('validateSignature', () => {
  it('should validate correct signature', () => {
    const sig = { x: 0, y: 0, image: 'data:', id: '1' };
    expect(validateSignature(sig)).toBe(true);
  });
});
```

## Git Workflow

### Commit Messages
```
feat: Add new signature color palette
fix: Resolve PDF zoom calculation bug
docs: Update README with API docs
refactor: Simplify component structure
```

### Ignore Sensitive Files
`.gitignore`:
```
node_modules/
.env.local
.env.*.local
.vercel/
.next/
dist/
build/
```

## Debugging

### Browser DevTools
- **F12** - Open developer tools
- **Console** - View logs and errors
- **Network** - Monitor API calls
- **Application** - Check storage/cookies
- **Performance** - Profile performance

### VS Code Debugging
Add `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js (full stack)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Console Logging
```typescript
console.log('Value:', value);        // Info
console.warn('Warning:', message);   // Warning
console.error('Error:', error);      // Error
console.table(Array.from(items));    // Formatted table
```

## Environment Variables

Add to `.env.local`:
```env
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=xxx
PUSHER_APP_ID=xxx
PUSHER_SECRET=xxx

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Your Custom Variables (prefix with NEXT_PUBLIC_ to expose to frontend)
NEXT_PUBLIC_MY_VAR=value
SECRET_VAR=secret_value
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables set
- [ ] Build succeeds (`npm run build`)
- [ ] Production build works (`npm start`)
- [ ] Tested on multiple browsers
- [ ] Performance optimized
- [ ] Security review completed

## Common Tasks

### Add New Color to Palette
Edit `components/PenControls.tsx`:
```typescript
const COLOR_PALETTE = [
  // ... existing colors
  { color: '#EE82EE', name: 'Violet' },
];
```

### Increase PDF Zoom Range
Edit `app/page.tsx`:
```typescript
<input type="range" min="0.25" max="4" step="0.1" value={zoom} />
```

### Add Export Format
Edit `lib/signature-utils.ts`:
```typescript
export const exportAsXML = (signatures: Signature[]) => {
  // Implementation
};
```

### Add Database Integration
1. Install database client (e.g., `npm install mongodb`)
2. Create database service in `lib/db.ts`
3. Update API routes to use database
4. Add environment variables for connection

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks API](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Pusher Documentation](https://pusher.com/docs)

---

## Need Help?

1. Check existing code for examples
2. Read TypeScript errors carefully
3. Use browser DevTools (F12)
4. Check Pusher dashboard
5. Review documentation

Happy developing! 🚀

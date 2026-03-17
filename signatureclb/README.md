# PDF Collab Sign ✍️

A modern, real-time collaborative PDF signature platform with advanced features built with Next.js and TypeScript.

## ✨ Key Features

### 🎯 Core Features
- **Real-time Collaboration** - Multiple users can sign the same PDF simultaneously using Pusher WebSocket integration
- **Click-to-Sign** - Click anywhere on the PDF to place your signature
- **Instant Updates** - See signatures appear in real-time as collaborators sign

### 🎨 Advanced Signature Tools
- **8-Color Palette** - Black, Red, Blue, Green, Orange, Purple, Cyan, Pink
- **Adjustable Pen Size** - 1-8px range with live preview
- **Undo Functionality** - Remove the last signature with one click
- **Trimmed Canvas** - Only saves the actual signature area (compact)

### 🔍 Smart PDF Viewer
- **Zoom Controls** - Scale from 0.5x to 2x with smooth transitions
- **Rotate PDF** - Rotate 90°, 180°, 270° and back
- **Native PDF Support** - Full PDF rendering in the browser
- **Responsive Layout** - Adapts to any screen size

### 👥 Collaboration Features
- **Online User Indicators** - See who's currently signing
- **Signature Timestamps** - Know exactly when each signature was placed
- **User Attribution** - Track which user created each signature
- **Real-time Status** - Live indicator showing active collaboration

### 📊 Export & Analytics
- **JSON Export** - Complete signature data with base64 images
- **CSV Export** - Spreadsheet-compatible format
- **Statistics Dashboard** - View totals, contributors, popular colors
- **Signature History** - Expandable panel with full details

### 🌓 User Experience
- **Dark Mode** - Smooth light/dark theme toggle
- **Modern UI** - Gradient design with Tailwind CSS
- **Smooth Animations** - Polished transitions and interactions
- **Responsive Design** - Works on desktop and tablet

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | Full-stack React framework |
| **React 18** | UI component library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Pusher** | Real-time WebSocket communication |
| **react-signature-canvas** | Signature drawing component |
| **Lucide React** | Beautiful icons |
| **PDF.js** | PDF rendering (native browser) |

## 📦 Project Structure

```
signatureclb/
├── app/
│   ├── page.tsx                 # Main application
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── api/
│       └── sign/
│           └── route.ts         # Signature API endpoint
│
├── components/                  # Reusable components
│   ├── Header.tsx              # Navigation & theme toggle
│   ├── PdfViewer.tsx           # PDF viewer with controls
│   ├── SignatureModal.tsx      # Signature drawing modal
│   ├── PenControls.tsx         # Color & size settings
│   ├── SignatureHistory.tsx    # History panel & export
│   └── OnlineUsers.tsx         # Collaboration indicator
│
├── lib/
│   ├── signature-utils.ts      # Utility functions for signatures
│   └── pusher-client.ts        # Real-time integration
│
├── public/                      # Static assets
├── .env.local.example          # Environment template
└── tsconfig.json               # TypeScript config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Pusher account (free at [pusher.com](https://pusher.com))

### Installation

1. **Clone and install:**
```bash
cd signatureclb
npm install
```

2. **Configure environment variables:**
```bash
cp .env.local.example .env.local
```

3. **Add your Pusher credentials to `.env.local`:**
```env
NEXT_PUBLIC_PUSHER_KEY=your_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here
PUSHER_APP_ID=your_app_id_here
PUSHER_SECRET=your_secret_here
```

4. **Start development server:**
```bash
npm run dev
```

5. **Open in browser:**
```
http://localhost:3000
```

## 📖 Usage Guide

### Basic Workflow

1. **Upload PDF** - Click the upload area to select your PDF file
2. **Click to Place** - Click anywhere on the PDF where you want to sign
3. **Draw Signature** - Use the signature pad to draw your unique signature
4. **Customize** - Adjust pen color and size as needed
5. **Submit** - Click "Sign ✓" to place the signature on the PDF
6. **View Live** - See other users' signatures appear in real-time

### Keyboard Shortcuts
- While signing: Draw with mouse/touch
- Modal buttons: Use tab to navigate, enter to confirm

### Features in Detail

**Pen Controls**
- Click color buttons to change pen color
- Drag slider to adjust pen size (1-8px)
- Preview shows your current settings

**PDF Viewer**
- Use +/- buttons or slider to zoom
- Click rotate button to rotate by 90°
- Scroll to pan when zoomed in
- Signatures scale to zoom level

**History Panel**
- Expand to see all signatures
- View metadata for each signature
- Export as JSON or CSV
- Clear history to start fresh

**Online Users**
- Green dot indicates online status
- Real-time updates as users join/leave
- See who's currently signing

## 🔌 API Reference

### POST /api/sign
Create and broadcast a new signature

**Request:**
```json
{
  "x": 150,
  "y": 200,
  "image": "data:image/png;base64,...",
  "id": "sig-abc123",
  "timestamp": "14:30:45",
  "userId": "User-ABC",
  "penColor": "#FF0000",
  "penSize": 2
}
```

**Response:**
```json
{
  "success": true,
  "signatureId": "sig-abc123",
  "totalSignatures": 5
}
```

### GET /api/sign
Retrieve all signatures (optional)

### DELETE /api/sign
Clear all signatures

## 🎨 Customization

### Change Colors
Edit the `COLOR_PALETTE` in [components/PenControls.tsx](components/PenControls.tsx):
```typescript
const COLOR_PALETTE = [
  { color: '#000000', name: 'Black' },
  // Add your colors here
];
```

### Adjust PDF Size
In [app/page.tsx](app/page.tsx), change the PDF container dimensions:
```typescript
style={{ width: '600px', height: '800px' }}
```

### Modify Theme
Tailwind classes are used throughout. Edit colors in:
- `app/globals.css` - Global styles
- `tailwind.config.js` - Color palette

## 📊 Export Features

### JSON Export
Perfect for data analysis and archival:
- Include full base64 images
- Complete metadata
- Timestamp for each signature

### CSV Export
Great for spreadsheets:
- ID, User, Position, Time
- Pen color and size
- Easy import to Excel/Sheets

### Statistics
Automatically calculated:
- Total signature count
- Signatures per user
- Average pen size
- Most used color

## 🔒 Security Notes

- Signatures generated client-side (no server processing)
- Data stored in memory only (add database for persistence)
- Pusher channels secure with TLS
- Validate all signature data on backend
- Use env vars for sensitive credentials

## 🚀 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables on Vercel
1. Go to Project Settings
2. Add environment variables:
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`

### Build Commands
```bash
npm run build  # Build for production
npm run start  # Start production server
```

## 🎯 Future Enhancements

- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] Multi-page PDF navigation
- [ ] Signature templates
- [ ] Email notifications
- [ ] Audit trail/compliance
- [ ] Mobile app
- [ ] OCR integration
- [ ] Digital certificate support
- [ ] Role-based access
- [ ] Document versioning

## 🐛 Troubleshooting

**PDF not showing?**
- Ensure the PDF is valid and accessible
- Check browser PDF viewer is enabled

**Signatures not syncing?**
- Verify Pusher credentials
- Check internet connection
- Confirm Pusher app is active

**Dark mode issues?**
- Clear browser cache
- Try hard refresh (Ctrl+Shift+R)

## 📚 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Pusher Docs](https://pusher.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 License

MIT License - feel free to use for personal and commercial projects!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💬 Support

Need help?
- Check the docs above
- Review console errors
- Check Pusher status page
- Open an issue on GitHub

---

**Made with ❤️ using Next.js, TypeScript & Tailwind CSS**

*Last updated: 2026-03-17*

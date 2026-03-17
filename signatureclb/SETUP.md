# Setup Guide 🚀

Step-by-step guide to get PDF Collab Sign running locally.

## Prerequisites ✅

- **Node.js** 18.x or higher ([Download](https://nodejs.org))
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for cloning)
- **Pusher account** (free tier at [pusher.com](https://pusher.com))

Verify installation:
```bash
node --version    # Should be 18.x+
npm --version     # Should be 9.x+
```

## Step 1: Pusher Setup 📡

### Create a Pusher Account

1. Go to [pusher.com](https://pusher.com)
2. Click "Get Started" → "Create Account"
3. Fill in your details and create account
4. Verify your email

### Create a Pusher Application

1. Log in to Pusher Dashboard
2. Click "Create app"
3. Name it: `pdf-collab-sign` (or your choice)
4. Select front-end → React → Development
5. Click "Create app"

### Get Your Credentials

On your app dashboard, you'll see:
- **App ID** - Long number
- **Cluster** - Like `mt1`, `us2`, `eu`
- **Key** - Starts with numbers
- **Secret** - Long encrypted string

Keep these handy! ⚠️

## Step 2: Project Setup 💻

### Clone or Download

```bash
# If you have the project directory
cd signatureclb
```

### Install Dependencies

```bash
npm install
```

This downloads all required packages (Next.js, React, Tailwind, etc.)

## Step 3: Environment Configuration ⚙️

### Create .env.local File

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Edit .env.local

Open `.env.local` in your editor and replace the placeholder values:

```env
# From your Pusher app settings
NEXT_PUBLIC_PUSHER_KEY=1234567890abcdef
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
PUSHER_APP_ID=1234567
PUSHER_SECRET=abcdefghijklmnopqrst

# Application settings (leave as is)
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Where to Find These Values

1. Go to Pusher Dashboard
2. Click your "pdf-collab-sign" app
3. Go to "Keys" tab
4. Copy each value:

| Environment Variable | Pusher Location |
|---------------------|-----------------|
| NEXT_PUBLIC_PUSHER_KEY | Key |
| NEXT_PUBLIC_PUSHER_CLUSTER | Cluster |
| PUSHER_APP_ID | App ID |
| PUSHER_SECRET | Secret |

⚠️ **IMPORTANT:**
- `NEXT_PUBLIC_*` variables are visible in browser (it's OK!)
- `PUSHER_SECRET` is sensitive - never commit to Git
- Add `.env.local` to `.gitignore`

## Step 4: Start Development Server 🎮

```bash
npm run dev
```

You should see:
```
> next dev

  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Step 5: Test the Application 🧪

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see "PDF Collab Sign" header
3. Upload a PDF file (or create one for testing)
4. Try clicking on the PDF to add a signature
5. Draw your signature and click "Sign ✓"

### Test in Multiple Browsers

1. Open app in two browser windows/tabs
2. Upload same PDF in both
3. Sign in one window
4. See signature appear in real-time in other window! 🎉

## Step 6: Build for Production 📦

When ready to deploy:

```bash
# Build optimized version
npm run build

# Test production build locally
npm run start
```

The app will be at [http://localhost:3000](http://localhost:3000)

## Troubleshooting 🔧

### PDF not loading?
- ✓ Ensure PDF file is valid
- ✓ Try a different PDF
- ✓ Check browser console for errors (F12)

### Signatures not syncing?
- ✓ Verify Pusher credentials are correct
- ✓ Check internet connection
- ✓ Ensure `.env.local` is in project root
- ✓ Restart dev server: `Ctrl+C` then `npm run dev`

### Port 3000 already in use?
```bash
# Use different port
npm run dev -- -p 3001
```

### Module not found errors?
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Dark mode not working?
- ✓ Clear browser cache (Ctrl+Shift+Delete)
- ✓ Try different browser

### "Cannot find Pusher" error?
- ✓ Check you have `.env.local` with correct variables
- ✓ Restart dev server
- ✓ Verify `NEXT_PUBLIC_PUSHER_KEY` is set

## Next Steps 🚀

### Learn the Features
- See [README.md](README.md) for complete feature list
- Try all pen colors and sizes
- Explore export options

### Customize
- Edit [app/page.tsx](app/page.tsx) to change layout
- Modify colors in `tailwind.config.js`
- Update company name/branding

### Deploy to Production

#### Option 1: Vercel (Easiest)
```bash
npm install -g vercel
vercel
```
Follow prompts and select your project folder.

#### Option 2: Other Hosting
- AWS
- Heroku  
- Digital Ocean
- Your own server

See [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

### Database Integration
For production, add a database to store signatures:
- MongoDB
- PostgreSQL
- Firebase
- AWS DynamoDB

## Advanced Configuration 🔬

### Enable Multiple Channels
Edit [lib/pusher-client.ts](lib/pusher-client.ts):
```typescript
const channel = pusher.subscribe('pdf-documents-' + pdfId);
```

### Custom Styling
Edit [app/globals.css](app/globals.css) for global styles
Edit component files for component-specific styling

### API Enhancements
Expand [app/api/sign/route.ts](app/api/sign/route.ts) with:
- Database operations
- Email notifications
- PDF generation
- Audit logging

## Security Checklist ✅

Before production:
- [ ] Don't commit `.env.local` to Git
- [ ] Use environment variables for secrets
- [ ] Enable CORS if needed
- [ ] Validate all user inputs
- [ ] Add rate limiting
- [ ] Use HTTPS everywhere
- [ ] Regular security updates

## Getting Help 🆘

### Official Resources
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Pusher Docs](https://pusher.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com)

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev
```

### Check Logs
- Browser Console: F12 > Console tab
- Terminal: Check output where you ran `npm run dev`

## Tips & Tricks 💡

1. **Use Chrome DevTools** - Inspect elements and debug JavaScript
2. **Lighthouse Audit** - Check performance (F12 > Lighthouse)
3. **Test on Mobile** - Use device preview in DevTools
4. **Use TypeScript** - Get better IDE help and error checking
5. **Commit Often** - Use Git to track changes

## Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check for errors
npm run lint

# Format code
npm run format  # (if configured)
```

## What's Installed? 📚

Your `node_modules` includes:
- **next** - React framework
- **react** - UI library
- **typescript** - Type safety
- **tailwindcss** - Styling
- **pusher-js** - Real-time client
- **pusher** - Real-time server
- **react-signature-canvas** - Signature drawer
- **lucide-react** - Icons

## File Structure

```
signatureclb/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── public/          # Static files
├── .env.local       # ← Your secrets (created)
├── package.json     # Project info & dependencies
├── tailwind.config  # Styling config
└── tsconfig.json    # TypeScript config
```

## Performance Tips ⚡

1. Use **Lighthouse** to audit (F12)
2. Lazy-load images with `next/image`
3. Optimize PDFs before upload
4. Limit signature history in memory

## Data Protection 🔒

By default:
- Signatures stored in memory (cleared on refresh)
- No data persisted to database
- **For production**: Add database + encryption

---

## Ready? Let's Go! 🎉

```bash
npm install          # Install dependencies
cp .env.local.example .env.local  # Copy config
# Edit .env.local with your Pusher keys
npm run dev          # Start server
# Open http://localhost:3000
```

Happy signing! ✍️

---

**Need more help?** Check README.md or open an issue on GitHub!

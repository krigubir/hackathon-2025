# Deployment Guide

## Deploying to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to production:
```bash
vercel --prod
```

### Option 2: GitHub Integration

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

### Option 3: Vercel Web UI

1. Build the project locally:
```bash
npm run build
```

2. Go to [vercel.com](https://vercel.com) and create a new project
3. Upload the `dist` folder
4. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Environment Configuration

The application doesn't require any environment variables for basic functionality.

## Post-Deployment

After deployment:

1. Test all captcha challenges work correctly
2. Verify routing works (refresh on any route should work due to `vercel.json` configuration)
3. Check mobile responsiveness
4. Ensure session persistence works across page refreshes

## Production Optimizations

The current build includes:
- Code splitting and tree shaking
- Minification
- Asset optimization

For further optimization, consider:
- Implementing dynamic imports for each captcha route
- Adding service worker for offline capability
- Implementing lazy loading for images

## Asset Replacement

Before production use, replace placeholder assets:

1. **Rhythm Game**: Add actual audio file (60-120 BPM loop)
2. **Video Counter**: Replace with actual counting video
3. **Object Identification**: Use curated images with hidden objects
4. **Emotion Recognition**: Replace with actual human face images

See README.md for detailed asset requirements.


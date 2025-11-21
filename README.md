# Dystopian Captcha Verification System

A futuristic, dystopian web application that presents users with a series of increasingly difficult CAPTCHA challenges designed to verify human identity in a world where AI has advanced to near-human capabilities.

## Overview

This application implements 6 unique CAPTCHA challenges:

1. **Rhythm Game** - Test rhythm perception and motor coordination by pressing keys in sync with audio cues
2. **Extreme Video Counter** - Count repetitions in a video that accelerates to absurd speeds
3. **Object Identification** - Find tiny hidden objects in a grid of images
4. **Mini Golf** - Complete a hole-in-one with realistic 2D physics
5. **Stop-in-the-Middle** - Test reaction time by stopping a fast-moving bar in a target zone
6. **Emotion Recognition** - Identify emotions in human faces

## Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling with custom dark/mustard-yellow theme
- **TanStack Router** - File-based routing
- **Tone.js** - Audio synthesis for rhythm game

## Design Philosophy

The UI follows a dystopian corporate aesthetic:
- Dark background (#0a0a0a)
- Mustard yellow accents (#d4a017)
- Minimalistic, serious design language
- Smooth transitions and motion
- Professional, regulated system feel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx      # Root layout with progress bar
│   ├── index.tsx       # Landing page
│   ├── complete.tsx    # Success page
│   └── captcha.*.tsx   # Individual captcha challenges
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CaptchaContainer.tsx
│   ├── ProgressBar.tsx
│   └── ResultScreen.tsx
├── contexts/           # React context providers
│   └── AppContext.tsx  # Global state management
├── types/              # TypeScript type definitions
│   └── index.ts
└── styles/             # Global styles
    └── index.css
```

## State Management

The application uses React Context with sessionStorage persistence to track:
- Completed captchas
- User progress
- Attempt counts per challenge
- Session start time

State persists across page refreshes during the session.

## Captcha Implementation Details

### Rhythm Game
- Uses Tone.js for audio synthesis
- 4 lanes (A, S, D, F keys)
- Real-time hit detection with timing window
- 70% accuracy required to pass

### Video Counter
- Progressive speed acceleration (1x to 3.5x)
- Multiple choice answers
- Allows ±2 margin of error

### Object Identification
- 4x4 grid of images
- Toggle selection interface
- Shows hints after first failure
- Immediate retry without modal

### Mini Golf
- Canvas-based 2D physics
- Drag-to-shoot mechanic
- Wall and obstacle collision
- Friction and velocity simulation

### Stop-in-the-Middle
- High-speed horizontal bar movement
- Spacebar to stop
- Target zone with tolerance
- Accuracy percentage feedback

### Emotion Recognition
- 6 emotion options
- Placeholder for actual face images
- Tests emotional intelligence

## Asset Requirements

The following assets need to be provided for production use:

- **Rhythm Game**: Audio file (60-120 BPM loop)
- **Video Counter**: MP4 video with repetitive action (~10 repetitions)
- **Object Identification**: 16 images with tiny hidden objects in specific tiles
- **Emotion Recognition**: Human face images for each emotion

Currently using placeholder URLs that should be replaced with actual assets.

## Deployment

This application is configured for deployment on Vercel.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

The `vercel.json` configuration ensures proper SPA routing.

## Future Enhancements

- Add more captcha variations
- Implement difficulty scaling
- Add analytics tracking
- Integrate with backend authentication
- Add sound effects and background audio
- Implement accessibility features
- Add multi-language support

## License

MIT

## Credits

Built for Hackathon 2025 - Future Shock Theme


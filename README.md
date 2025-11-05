
# English Vocabulary Learning App

A mobile-first Progressive Web App (PWA) for learning English vocabulary with interactive lessons, quizzes, progress tracking, and AI-powered explanations.

The original design is available at [Figma](https://www.figma.com/design/7gO2pa7QX0C2ABr6qHBsXS/English-Vocabulary-Learning-App).

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with PWA support
- 📚 **Interactive Lessons**: Learn vocabulary with structured lessons
- 🎯 **Quizzes**: Test your knowledge with interactive quizzes
- 📊 **Progress Tracking**: Monitor your learning streak and progress
- 📝 **Notebook**: Save and review vocabulary
- 🎤 **Shadowing**: Practice pronunciation with shadowing exercises
- 🤖 **AI Explanations**: Get AI-powered explanations for vocabulary

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **PWA** support with service workers

## Getting Started

### Prerequisites

- **Node.js 18+** and npm (required - the project uses modern features that require Node 18+)
- If you're using an older Node version, you can use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node versions

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd English_Project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect the Vite configuration
4. Deploy!

The `vercel.json` file is already configured for you.

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Netlify will automatically detect the `netlify.toml` configuration
4. Deploy!

### GitHub Pages

1. Push your code to GitHub
2. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy to GitHub Pages on push to main/master
3. Enable GitHub Pages in your repository settings
4. Your app will be available at `https://<username>.github.io/<repo-name>`

### Manual Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy the `dist` folder to any static hosting service:
   - AWS S3 + CloudFront
   - Firebase Hosting
   - Azure Static Web Apps
   - Any web server

## PWA Setup

The app is configured as a Progressive Web App (PWA). To complete the setup:

1. **Create App Icons**: 
   - Create `icon-192.png` (192x192 pixels)
   - Create `icon-512.png` (512x512 pixels)
   - Place them in the `public` folder
   - You can use tools like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/)

2. **Create Favicon**:
   - Create `favicon.svg` in the `public` folder
   - Or use a PNG/JPG version

3. The manifest and service worker are automatically configured.

## Mobile App Installation

Users can install the app on their mobile devices:

1. **iOS (Safari)**:
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"

2. **Android (Chrome)**:
   - Open the app in Chrome
   - Tap the menu (three dots)
   - Select "Add to Home screen" or "Install App"

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
English_Project/
├── src/
│   ├── components/     # React components
│   ├── styles/         # Global styles
│   └── App.tsx         # Main app component
├── public/             # Static assets
├── dist/               # Production build (generated)
└── vite.config.ts      # Vite configuration
```

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue in the repository.
  
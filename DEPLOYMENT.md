# Deployment Guide

This guide provides detailed instructions for deploying the English Vocabulary Learning App to various platforms.

## Quick Deploy Options

### 🚀 Vercel (Easiest - Recommended)

1. **Via GitHub**:
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

2. **Via Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

### 🌐 Netlify

1. **Via GitHub**:
   - Push your code to GitHub
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify auto-detects `netlify.toml`
   - Click "Deploy site"

2. **Via Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

### 📱 GitHub Pages

1. **Automatic (via GitHub Actions)**:
   - Push code to `main` or `master` branch
   - GitHub Actions will automatically deploy
   - Go to Settings → Pages in your repository
   - Enable GitHub Pages

2. **Manual**:
   ```bash
   npm run build
   # Then push dist/ folder to gh-pages branch
   ```

## Environment Variables

If you need environment variables:

1. **Vercel**: Add in Project Settings → Environment Variables
2. **Netlify**: Add in Site Settings → Environment Variables
3. **GitHub Pages**: Use repository secrets in GitHub Actions

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS as instructed

## Build Configuration

The app is pre-configured for:
- ✅ Vercel (vercel.json)
- ✅ Netlify (netlify.toml)
- ✅ GitHub Pages (.github/workflows/deploy.yml)

## PWA Icons Setup

Before deploying, create app icons:

1. **Create Icons**:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
   - Place in `public/` folder

2. **Tools**:
   - [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### PWA Not Working
- Ensure icons are in `public/` folder
- Check that service worker is registered (check browser DevTools)
- Verify HTTPS is enabled (required for PWA)

### Routing Issues
- All platforms are configured with SPA routing (redirect to index.html)
- If issues persist, check the platform-specific configuration files

## Performance Optimization

The build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## Monitoring

Consider adding:
- Analytics (Google Analytics, Plausible, etc.)
- Error tracking (Sentry, LogRocket, etc.)
- Performance monitoring


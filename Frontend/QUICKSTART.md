# Quick Start Guide - Frontend Development

Get the frontend running in 3 minutes!

## 🚀 Prerequisites

- Node.js 18+ and npm
- Backend running at http://localhost:8000

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env (make sure VITE_API_BASE_URL matches backend)
# Default is already correct: http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

App starts at: **http://localhost:5173**

### 4. Test Login

Use test credentials from backend seed:
- **Admin**: A001 / admin123
- **Faculty**: F1023 / fac123
- **HOD**: H001 / hod123

## 📦 Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

Output in: `dist/` directory

## 🔧 Common Commands

```bash
# Development server (hot reload enabled)
npm run dev

# Build optimized for production
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── components/       # React components
├── features/         # Feature modules
├── hooks/            # Custom hooks
├── pages/            # Page components
├── services/         # API services
├── types/            # TypeScript types
├── styles/           # Global styles
└── App.tsx           # Root component

public/               # Static assets
dist/                 # Production build output
```

## 🆘 Troubleshooting

### Port already in use
```bash
npm run dev -- --port 5174
```

### API connection errors
1. Verify backend is running: http://localhost:8000/docs
2. Check `.env` has correct `VITE_API_BASE_URL`
3. Clear browser cache and hard reload (Ctrl+Shift+R)

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Check types
npm run type-check

# If needed, rebuild
npm run build
```

## 📚 Development Tips

### Hot Module Replacement (HMR)
Changes auto-reload in browser. No manual refresh needed!

### Browser DevTools
- Open with F12
- React DevTools: Install browser extension
- Check Network tab for API calls
- Use Application tab to inspect sessionStorage for tokens

### API Testing
- Backend Swagger UI: http://localhost:8000/docs
- Use Postman or Insomnia for manual testing

### Common Patterns

**Making API calls:**
```typescript
import { authApi } from '@/services/api/auth';

const response = await authApi.login({
  identifier: 'A001',
  password: 'admin123',
  selectedRole: 'admin'
});
```

**Using authentication:**
```typescript
import { useSession } from '@/hooks/useSession';

const { user, token, login, logout } = useSession();
```

**Fetching with token:**
```typescript
const response = await fetch('http://localhost:8000/api/timetables', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## 🎯 Next Steps

1. Read [README.md](../README.md) for full documentation
2. Check backend API docs at http://localhost:8000/docs
3. Review example components in `src/components/`
4. See [CLAUDE.md](../CLAUDE.md) for architecture

## 💡 Pro Tips

- Use `npm run build` to check for TypeScript errors early
- Press `r` in dev server terminal to restart
- Press `u` in terminal to show UI (Vite feature)
- Vite is very fast - use for rapid development

Happy coding! 🎉

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js app in this repository.

## Next.js App Overview

This is the web application for the 90-Hard fitness tracking app, built with Next.js 15.4.6. It provides server-side rendering, SEO optimization, and serves as the web platform for the universal app.

## Key Features

- Server-side rendering with App Router
- Universal components from `@app-core`
- GraphQL API endpoint at `/api/graphql`
- Image optimization with Cloudflare Images/R2
- Tailwind CSS via NativeWind for styling
- Progressive Web App capabilities

## Development Commands

```bash
# Run Next.js development server
pnpm run dev:web

# Build and preview production build
pnpm run build:preview

# Run tests specific to web components
pnpm test -- apps/next

# Run E2E tests (targets web by default)
pnpm run test:e2e
```

## App Structure

```
/apps/next/
├── app/                    # App Router directory
│   ├── (generated)/       # Auto-generated pages from routes
│   ├── api/               # API routes
│   │   ├── graphql/       # GraphQL endpoint
│   │   └── uploads/       # File upload endpoints
│   ├── ai-demo/           # AI feature demos
│   ├── heatmap-demo/      # Heatmap visualization demo
│   ├── images-demo/       # Image handling demo
│   └── r2-demo/          # Cloudflare R2 integration demo
├── components/            # Next.js specific components
├── lib/                   # Utility functions
├── public/               # Static assets
└── next.config.base.cjs  # Base Next.js configuration
```

## Platform-Specific Patterns

### Component Resolution
- `.tsx` files: Universal components (work on both web and mobile)
- `.web.tsx` or `.next.tsx`: Web-specific implementations
- Components from `@app-core` are automatically resolved for web

### Styling
- Use NativeWind classes for universal styling
- Web-specific styles can use regular Tailwind classes
- Global styles in `global.css`

### Data Fetching
- Server Components: Direct database queries or fetch
- Client Components: Use React Query hooks from `@app-core`
- API Routes: REST endpoints in `/app/api/*/route.ts`

## Common Tasks

### Adding a New Page
1. Create route in `/features/@app-core/routes/`
2. Run `pnpm run link:routes` to sync with Next.js
3. Page appears in `/app/(generated)/`

### Creating API Endpoints
```typescript
// app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  // Handle GET request
}

export async function POST(request: Request) {
  // Handle POST request
}
```

### Working with Images
- Use Cloudflare Images integration for uploads
- Reference implementation in `/app/api/uploads/`
- Image optimization handled automatically

## Environment Variables

Web-specific env vars must be prefixed with `NEXT_PUBLIC_` for client access:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
- `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`

## Testing Considerations

- E2E tests use Playwright and target `http://localhost:3000`
- Component tests should mock platform-specific APIs
- Use `@testing-library/react` for component testing

## Common Gotchas

1. **Route Generation**: Changes in `/features` require `npm run link:routes`
2. **Build Errors**: Clear `.next` directory if builds fail mysteriously
3. **Image Imports**: Use Next.js Image component for optimization
4. **API Routes**: Must export named functions (GET, POST, etc.)
5. **Hydration**: Ensure server/client rendering consistency
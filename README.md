# Legacy Wall Charts

Premium football wall chart creator built with React, Vite, TanStack Router and Neon.

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Required Vercel environment variables

- `VITE_NEON_DATA_API_URL`
- `VITE_NEON_AUTH_URL`
- `VITE_ASSET_BASE_URL` optional. Leave blank unless you move static assets to your own CDN.

## Database setup

Run SQL migrations in `neon/migrations` in order.

## Notes

The image upload component currently stores selected images as browser data URLs for testing. Replace this with proper storage before public launch.

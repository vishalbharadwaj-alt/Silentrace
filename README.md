# SilentRace · Silent Speech Companion

SilentRace is a Vite + TanStack Start web app for the SilentRace silent-speech neckband. The UI is organized around three core areas: a live dashboard, an analysis view, and settings for personalization.

## What’s in this repo

- `src/` - the main web app, including the router, shell, dashboard, analysis, and settings views
- `backend/` - service scaffolding for auth, user, notification, and Python decode/internal services
- `auth-service/`, `user-service/`, `notification-service/` - standalone Node service variants
- `decode-service/` - Python decode service scaffold
- `ai-services/` - containerized AI service entry point

## Requirements

- Node.js 20+ or Bun
- npm, Bun, or another compatible package manager

## Frontend development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend services

The backend scaffold and service-specific setup steps are documented in [backend/README.md](backend/README.md).

## Notes

- The app uses TanStack Start with `src/server.ts` as the server entry.
- The backend folders are scaffolds intended to be wired into real auth, user, notification, and speech-processing services.

# Cinematic Digital Experience

A premium, animation-rich landing page with scroll-driven storytelling and an AI chat assistant for signed-in users.

## Features

- Cinematic landing page with custom animated components: magnetic buttons, split-text reveals, a glowing orb and a scroll-driven story section
- User authentication with Supabase
- AI chat for authenticated users, streamed through a server API route
- Responsive, minimal design built on Tailwind CSS and shadcn/ui

## Tech stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (React, TanStack Router, server routes), TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui (Radix UI), Lucide icons |
| Data and auth | Supabase, Drizzle ORM, TanStack Query |
| Testing | Vitest |

## Getting started

```bash
npm install          # or: bun install
npm run dev
```

Supabase connection settings are read from `.env`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Run tests with Vitest |
| `npm run lint` | Lint with ESLint |

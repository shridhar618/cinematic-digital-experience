# Cinematic Digital Experience

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Filament Tracker — a Next.js 16 application for tracking 3D printing filament. Currently in early development (bootstrapped from `create-next-app`).

## Commands

- `npm run dev` — Start development server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config with core-web-vitals + TypeScript rules)
- `npm start` — Serve production build

## Tech Stack

- **Next.js 16** with App Router (`app/` directory)
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS v4** via PostCSS plugin (`@tailwindcss/postcss`)
- **Geist** font family (sans + mono) loaded via `next/font/google`
- Path alias: `@/*` maps to project root

## Architecture

- `app/layout.tsx` — Root layout with Geist font CSS variables and dark mode support
- `app/page.tsx` — Home page (single route so far)
- `app/globals.css` — Tailwind import + CSS custom properties for light/dark theming via `@theme inline`
- `next.config.ts` — Next.js configuration (currently default)
- `eslint.config.mjs` — ESLint flat config extending `eslint-config-next` (core-web-vitals + typescript)

## Tailwind CSS v4 Notes

This project uses Tailwind v4 which differs from v3:
- CSS import: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Theme customization uses `@theme inline` blocks in CSS, not `tailwind.config.js`
- No `tailwind.config.js` file — configuration lives in CSS

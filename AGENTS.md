# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript recipe browser. Application code lives in `src/`: `pages/` for route views, `components/` for reusable UI, `lib/` for helpers, `types/` for shared types, and `data/recipes.json` for generated metadata. Recipe Markdown is under `public/content/dishes/<category>/`, images under `public/images/dishes/<category>/`, and category indexes in `menus/`. Maintenance scripts live in `scripts/`; CI workflows live in `.github/workflows/`.

## Build, Test, and Development Commands

Use `pnpm` because the repository includes `pnpm-lock.yaml`.

- `pnpm install`: install dependencies.
- `pnpm run generate-recipes`: rebuild `src/data/recipes.json` from Markdown and assets.
- `pnpm run dev`: start the local Vite development server.
- `pnpm run build`: type-check and create the production bundle.
- `pnpm run preview`: serve the built bundle.
- `pnpm run lint`: run ESLint.
- `pnpm run check`: run TypeScript checking without emit.
- `pnpm run compress-images` / `pnpm run generate-menu-pdfs`: refresh generated content artifacts when needed.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Keep 2-space indentation, semicolons, and the existing import style. Name components in PascalCase, hooks and utilities in camelCase, and shared types with descriptive PascalCase names. Prefer the `@/` alias for imports from `src`. Keep Tailwind classes close to the JSX they style, and avoid unrelated formatting churn.

## Testing Guidelines

No dedicated unit-test framework is configured. Treat `pnpm run lint`, `pnpm run check`, and `pnpm run build` as required validation before submitting changes. For UI or content changes, run `pnpm run dev` and manually verify search, category navigation, image loading, favorites, and export flows. If tests are added, colocate them near changed source as `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses concise messages with prefixes such as `feat:`, `build:`, `ci:`, and `chore(scope):`, alongside short Chinese summaries. Prefer that style and keep each commit focused. Pull requests should include a summary, linked issue when available, validation commands, screenshots for UI changes, and notes for generated files or Git LFS assets.

## Security & Configuration Tips

Do not commit secrets or local environment files. The default build base targets GitHub Pages; for root-path local or self-hosted builds, use `VITE_BASE_PATH=/ pnpm run build`. Keep generated images in `public/images/dishes/` and follow the README's Git LFS expectations.

## Agent-Specific Instructions

When operating in this repository, respond to users in Simplified Chinese. Read existing patterns before editing, keep changes scoped, and never revert unrelated user changes.

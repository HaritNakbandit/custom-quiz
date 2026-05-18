@AGENTS.md

# Claude-Specific Instructions

## Before writing any code
Read `node_modules/next/dist/docs/` for the exact Next.js version in use. APIs and conventions may differ from training data.

## Tailwind v4 gotchas
- Use `@import "tailwindcss"` — not the old `@tailwind` directives
- Dark mode needs `@custom-variant dark (&:where(.dark, .dark *))` in globals.css
- Arbitrary values like `w-[500px]` are fine but prefer canonical (`w-125`) when the IDE suggests it

## Styling rules
- All new UI components: use `.glass` class for card surfaces, `.quiz-input` for form inputs
- For text that must be readable on dark glass surfaces, use explicit Tailwind `dark:text-white/XX` — do not rely on `var(--text-muted)` alone
- Modals that need to render above everything: use `createPortal(…, document.body)` + `fixed inset-0 z-50`
- Every async-loaded page must have a **skeleton loading state** — shapes must match the real layout, use `glass animate-pulse`

## Styling rules for dark-background modals
- `AIGeneratePanel` has a hardcoded dark background — use `text-white/XX` directly, never `text-gray-*` or `dark:text-*`
- Placeholder color in dark modals: use `placeholder:text-white/40!` (with `!` for important) to override `.quiz-input::placeholder`

## State & data
- All quiz data lives in Supabase — never use localStorage
- `quizzes` table: all quizzes, fetched via `useCustomQuizzes` (returns `userId` for ownership checks)
- `quiz_attempts` table: one row per quiz submission — written in `quiz/[id]/page.tsx → handleSubmit`, NOT in results page (avoids duplicate on refresh)
- `profiles` table: roles — use `useProfile()` to get `{ role, isAdmin }`
- Never read `profiles` table directly; never write to it from client code
- Supabase browser client must be created at **module level** (singleton), not inside components or hooks

## Auth & roles
- `proxy.ts` is Next.js 16's replacement for `middleware.ts` — do NOT create `middleware.ts`
- All routes require auth; public-only list is `/login` and `/auth` in `proxy.ts`
- Admin check in UI: use `useProfile().isAdmin` — never hardcode email/uid
- Edit page enforces ownership at load time: redirects to `/` if `quiz.user_id !== currentUser.id`

## Accent color theming
- All blue/indigo accent classes live in `lib/theme.ts` — import from there, never hardcode
- To retheme: edit `lib/theme.ts` + update orb/border CSS vars in `globals.css`

## Quiz taking flow
- Free navigation between questions (prev/next + clickable dots)
- No in-quiz feedback — options show selection highlight only (quiz color)
- Submit button enabled only when all questions answered
- Results page: shows score ring + full answer review per question

## AI generation
- Model ID and display name are in `lib/config.ts` (`AI_MODEL`, `AI_MODEL_DISPLAY`)
- The Gemini route streams raw JSON — client must buffer full stream before `JSON.parse`
- Strip markdown fences before parsing: `.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()`
- `GEMINI_API_KEY` must be in `.env.local`; never expose client-side

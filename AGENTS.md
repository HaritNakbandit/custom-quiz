<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Custom Quiz — Project Overview

## Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — uses `@import "tailwindcss"` and `@custom-variant dark (&:where(.dark, .dark *))`, NOT `@tailwind base/components/utilities`
- **next-themes** — dark mode via `attribute="class"`, class `.dark` on `<html>`
- **lucide-react** — all icons
- **@google/genai** — Gemini 3 Flash for AI quiz generation (`gemini-3-flash-preview`, configured in `lib/config.ts`)
- **@supabase/supabase-js + @supabase/ssr** — auth (Email + Google OAuth) and database
- **No localStorage** — all data lives in Supabase

## File Structure
```
app/
  (views)/               # Route group — pages only, no URL impact
    page.tsx             # Home: quiz grid + hero + UserMenu (with history link)
    create/page.tsx      # Create new quiz form (admin only)
    history/page.tsx     # Quiz attempt history list
    quiz/[id]/
      page.tsx           # Quiz taking page (free nav, submit when all answered)
      edit/page.tsx      # Edit quiz (owner only — checks user_id at load)
      results/page.tsx   # Score + full answer review
  login/
    page.tsx             # Login / signup page (Email + Google OAuth)
  auth/
    callback/route.ts    # Supabase OAuth callback handler
  api/
    generate-quiz/route.ts  # POST — Gemini AI generation (streaming)
  globals.css            # CSS variables (:root / .dark), .glass, .glass-hover, .quiz-input, animations
  layout.tsx             # Root layout with ThemeProvider
components/
  QuizGrid.tsx           # Card grid; shows ⋮ menu only for quiz owner (user_id match)
  AIGeneratePanel.tsx    # Chat-style modal for AI-powered quiz generation
  CreateQuizButton.tsx   # "สร้าง Quiz ใหม่" — visible to admin only
  UserMenu.tsx           # Email + dropdown: ประวัติการทำข้อสอบ, ออกจากระบบ
  ThemeProvider.tsx      # next-themes provider wrapper
  ThemeToggle.tsx        # Sun/Moon toggle button
data/
  quizzes.ts             # Quiz/Question TypeScript interfaces only (no hardcoded data)
hooks/
  useCustomQuizzes.ts    # Supabase CRUD for `quizzes` table; returns userId
  useProfile.ts          # Returns { role, isAdmin } for current user
lib/
  config.ts              # AI_MODEL, AI_MODEL_DISPLAY constants
  quizIcons.tsx          # QuizIcon component, ICON_MAP (20 lucide icons), COLOR_MAP (9 themes)
  supabase/
    client.ts            # createClient() — browser Supabase client
    server.ts            # createClient() — server Supabase client (uses cookies)
proxy.ts                 # Protects /create /quiz /history — redirects to /login if unauthenticated
```

## Key Conventions

### Supabase client — singleton pattern
Always create the browser client at **module level**, not inside the component or hook:
```ts
const supabase = createClient()   // top of file, outside component

export default function MyComponent() { ... }
```
Creating it inside the component causes a new instance per render and triggers `react-hooks/exhaustive-deps` warnings.

### CSS Variables (globals.css)
All theming goes through CSS variables. Never hardcode colors that should respond to theme.
- `--background`, `--foreground` — page bg and body text
- `--glass-bg`, `--glass-border` — glassmorphism card style (use `.glass` class)
- `--text-muted`, `--text-faint` — secondary/tertiary text
- `--input-bg`, `--input-border`, `--input-focus-*` — form inputs (use `.quiz-input` class)

For dark mode, **always prefer explicit Tailwind `dark:` classes** (`dark:text-white/75`) over CSS variables for elements where contrast is critical (headers, interactive elements, modal content).

### Dark Mode
Tailwind v4 dark mode requires the custom variant declaration in globals.css:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Without this, `dark:` prefixes won't work.

### Skeleton Loading
Every page that fetches async data must show a skeleton (not a spinner or loading text). Skeleton shapes must match the real layout — same dimensions, positions, and card structure. Use `glass animate-pulse` for each placeholder element.

### Tailwind v4 — canonical classes
Prefer named spacing over arbitrary values when Tailwind has an equivalent:
- `w-[120px]` → `w-30`, `h-[160px]` → `h-40`, `w-[700px]` → `w-175`
- The IDE Tailwind extension will suggest canonical rewrites — apply them

### Quiz Data Shape
```ts
interface Quiz {
  id: string
  user_id?: string  // set by Supabase; present on `quizzes` table rows
  title: string
  description: string
  category: string
  icon: string      // key from ICON_MAP
  color: string     // key from COLOR_MAP
  questions: Question[]
}

interface Question {
  id: number
  question: string
  options: string[]       // always 4 options
  correctIndex: number    // 0–3
  explanation?: string
}
```

### Quiz Attempt Shape (quiz_attempts table)
```ts
interface QuizAttempt {
  id: string           // uuid
  user_id: string
  quiz_id: string
  quiz_title: string
  quiz_icon: string
  quiz_color: string
  score: number
  total: number
  answers: number[]    // stored as jsonb; index = question index, value = selected option
  created_at: string
}
```

### Supabase Tables
| Table | Who writes | Who reads |
|---|---|---|
| `quizzes` | owner only (RLS) | all authenticated users |
| `profiles` | trigger on signup | owner only |
| `quiz_attempts` | owner only (RLS) | owner only |

- `profiles.role` is `'user'` by default; set to `'admin'` manually in dashboard
- Use `useProfile()` to get `{ role, isAdmin }` — never fetch profiles table directly
- `quiz_attempts` is written from `quiz/[id]/page.tsx → handleSubmit` (not results page, to avoid duplicate on refresh)

### Roles & Access
- **admin**: can see "สร้าง Quiz ใหม่" button, can create/edit/delete own quizzes
- **user**: can take quizzes, view history; cannot access `/create` or edit any quiz
- Edit page enforces ownership: checks `quiz.user_id === auth.uid()` and redirects if mismatch
- Protected routes in `proxy.ts`: `/create`, `/quiz`, `/history`

### Quiz Taking Flow
1. User navigates freely between questions using prev/next arrows or clicking step dots
2. Selecting an option highlights it (quiz color) — no correct/wrong feedback shown
3. Submit button (`ส่งคำตอบ`) activates only when all questions are answered
4. On submit: saves attempt to `quiz_attempts`, then navigates to results page
5. Results page shows score ring + full answer review (correct/wrong per question with explanations)

### AI Generation Route
`POST /api/generate-quiz` — accepts `{ messages: { role: "user"|"model", content: string }[] }`, streams raw JSON. Client buffers full stream then `JSON.parse`. Model ID comes from `AI_MODEL` in `lib/config.ts`.

Response shape:
```json
{ "questions": [...], "suggestedTitle": "...", "suggestedCategory": "..." }
```

### Modals with hardcoded dark background
`AIGeneratePanel` uses `background: "rgba(18,10,35,0.92)"` as inline style — always dark regardless of theme. All text inside must use explicit `text-white/XX` values, never `text-gray-*` or `dark:` variants.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
```

## Dev
```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

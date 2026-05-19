# Custom Quiz

แอปสร้างและทำข้อสอบออนไลน์ พร้อม AI สร้างคำถามอัตโนมัติ

**Production:** https://custom-quiz-rho.vercel.app

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** — Auth (Email + Google OAuth) + Database
- **Google Gemini** — AI สร้างคำถาม

## Getting Started

1. ติดตั้ง dependencies

```bash
npm install
```

2. ตั้งค่า environment variables

```bash
cp .env.example .env.local
```

แล้วใส่ค่าใน `.env.local` ตาม `.env.example`

3. รัน dev server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | แหล่งที่มา | หมายเหตุ |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API | |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | server-only ห้ามใช้ `NEXT_PUBLIC_` |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | |

## Supabase Setup

เพิ่ม Redirect URLs ใน Authentication → URL Configuration:

```
https://custom-quiz-rho.vercel.app/auth/callback
http://localhost:3000/**
```

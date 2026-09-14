# Counting LMS

Interactive Learning Management System for early childhood education. The
first learning domain is counting/number recognition; the architecture is
designed to support additional domains (numbers, addition, shapes, alphabet,
etc.) without rebuilding the application.

Full product requirements: `docs/PRD.md`.

## Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS
- Prisma ORM + PostgreSQL (Neon in production) — added in Phase 1
- Auth.js (NextAuth) — added in Phase 2

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run lint    # eslint
```

## Project structure

```
src/
├── app/          # routes (App Router)
├── components/   # ui/, activities/, learning/, child/, parent/, teacher/, admin/
├── lib/          # domain logic (db, auth, permissions, scoring, progress, recommendations)
├── server/
│   └── actions/  # server actions (mutations)
└── types/
```

Development proceeds in phases (Foundation → Database → Auth → Child
Profiles → Content Engine → Activity Engine → Learning Data →
Gamification → Parent Dashboard → Admin → Teacher → Monetization → AI). See
`docs/PRD.md` for details.

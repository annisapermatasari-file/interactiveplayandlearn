# Counting LMS

Interactive Learning Management System for early childhood education. The
first learning domain is counting/number recognition; the architecture is
designed to support additional domains (numbers, addition, shapes, alphabet,
etc.) without rebuilding the application.

Full product requirements: `docs/PRD.md`.

## Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS
- Prisma ORM (7.x, `prisma-client` generator + `@prisma/adapter-pg`) + PostgreSQL (Neon in production)
- Auth.js (NextAuth v5) — Credentials provider, JWT sessions, Node.js `proxy.ts` for route protection

## Getting started

```bash
cp .env.example .env   # set DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)
npm install             # also runs `prisma generate` via postinstall
npm run db:migrate      # create/apply migrations
npm run db:seed         # load demo org/users/course/content
npm run dev
```

Visit `/register` to create a parent account, or `/login` with a seeded demo
account below. `/parent` is protected — signed-out visitors are redirected to
`/login`.

Open [http://localhost:3000](http://localhost:3000).

Demo accounts created by the seed (`prisma/seed.ts`, development only):

| Role   | Email                     | Password       |
|--------|---------------------------|----------------|
| Admin  | admin@countinglms.dev     | ChangeMe123!   |
| Parent | parent@countinglms.dev    | ChangeMe123!   |

## Scripts

```bash
npm run dev               # start dev server
npm run build              # production build
npm run lint                # eslint
npm run db:generate         # regenerate the Prisma client
npm run db:migrate          # create + apply a dev migration
npm run db:migrate:deploy   # apply migrations (production/CI)
npm run db:seed             # run prisma/seed.ts
npm run db:studio           # Prisma Studio
```

## Project structure

```
src/
├── app/          # routes (App Router): /, /login, /register, /parent, /parent/children[/[childId]],
│                 #   /learn, /learn/courses/[courseId], /learn/lessons/[lessonId][/play],
│                 #   /api/auth/[...nextauth]
├── components/   # ui/, auth/, child/, learning/, activities/, parent/, teacher/, admin/
├── lib/          # domain logic (db, auth, auth.config, permissions, content, scoring, progress, recommendations)
├── generated/    # Prisma client output (git-ignored, regenerated via `prisma generate`)
├── server/
│   └── actions/  # server actions (mutations)
├── proxy.ts      # route protection (Next.js 16's proxy convention, formerly "middleware")
└── types/

prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

Development proceeds in phases (Foundation → Database → Auth → Child
Profiles → Content Engine → Activity Engine → Learning Data →
Gamification → Parent Dashboard → Admin → Teacher → Monetization → AI). See
`docs/PRD.md` for details.

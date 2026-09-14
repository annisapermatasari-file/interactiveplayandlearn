# COUNTING LMS --- PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Document version:** 1.0\
**Status:** Build-ready MVP specification\
**Primary coding assistant:** Claude Code\
**Target:** Production-ready SaaS LMS for early childhood learning\
**Language:** Indonesian for product UI and documentation; English is
acceptable for code identifiers

------------------------------------------------------------------------

# 1. PRODUCT OVERVIEW

## 1.1 Product name

Working name: **Counting LMS**

This product is an interactive Learning Management System for early
childhood education. The first learning domain is counting and number
recognition, using the supplied counting worksheet assets as the initial
content source.

The product must NOT be built as a simple worksheet viewer.

The core product is:

**Child Profile → Learning Path → Lesson → Interactive Activity →
Instant Feedback → XP/Stars → Progress → Parent Dashboard**

The architecture must allow new learning domains to be added later
without rebuilding the application.

Future domains may include:

-   Numbers
-   Addition
-   Subtraction
-   Shapes
-   Patterns
-   Alphabet
-   Phonics
-   Reading
-   Writing
-   Colors
-   Logic
-   Early mathematics

------------------------------------------------------------------------

# 2. PRODUCT GOALS

## 2.1 Primary goals

Build a serious, scalable LMS that:

1.  Allows parents to create accounts.
2.  Allows parents to create child profiles.
3.  Allows children to select their own profile.
4.  Provides structured learning paths.
5.  Provides interactive lessons rather than static worksheets only.
6.  Saves every meaningful learning attempt.
7.  Calculates scores on the server.
8.  Tracks lesson progress.
9.  Tracks skill mastery.
10. Rewards children with XP, stars, badges, and streaks.
11. Provides parents with meaningful progress analytics.
12. Provides administrators with a content management system.
13. Supports future teachers, classrooms, schools, and learning centers.
14. Supports future subscriptions and SaaS billing.
15. Is designed for multi-tenant data isolation from the beginning.

## 2.2 Non-goals for MVP

Do NOT build these before the core LMS works:

-   AI tutor
-   AI-generated questions
-   complex adaptive learning
-   payment gateway
-   school billing
-   teacher marketplace
-   native mobile applications
-   real-time multiplayer
-   unnecessary social features

AI and monetization are future phases.

------------------------------------------------------------------------

# 3. TARGET USERS

## 3.1 Parent

Parents are the primary account holders in the MVP.

Capabilities:

-   Register
-   Login
-   Create child profiles
-   Select child
-   View child progress
-   View completed lessons
-   View scores
-   View XP
-   View stars
-   View badges
-   View skill mastery
-   See recommended next lessons

## 3.2 Child

Children do not need independent email/password accounts in MVP.

A child is represented by a child profile belonging to a parent.

Capabilities:

-   Select profile
-   Open learning path
-   Start lesson
-   Complete interactive activities
-   Receive immediate feedback
-   Earn XP
-   Earn stars
-   Earn badges
-   View own progress

The child UI must be visually simple and age-appropriate.

## 3.3 Admin

Admin capabilities:

-   Manage organizations
-   Manage courses
-   Manage modules
-   Manage lessons
-   Manage activities
-   Manage questions
-   Manage media
-   Publish/unpublish content
-   View platform-level analytics

## 3.4 Teacher --- future phase

Teacher capabilities:

-   Create classes
-   Add students
-   Assign lessons
-   Monitor students
-   Review class analytics

------------------------------------------------------------------------

# 4. BUSINESS MODEL

The architecture must support SaaS plans even if payment is not
implemented in MVP.

Potential plans:

### Free

-   Limited child profiles
-   Limited lessons
-   Basic progress tracking

### Pro

Potential pricing:

**Rp49.000--99.000/month**

Potential features:

-   More child profiles
-   Full learning library
-   Advanced progress reports
-   Badges and gamification
-   Parent insights

### School / Learning Center

Future institutional licensing.

Must support:

-   Multiple teachers
-   Multiple classes
-   Multiple children
-   Organization-level content
-   Organization analytics
-   Assignments
-   Role-based permissions

------------------------------------------------------------------------

# 5. RECOMMENDED TECH STACK

Do NOT use Supabase.

Use:

-   Next.js
-   TypeScript
-   React
-   App Router
-   Tailwind CSS
-   Prisma ORM
-   PostgreSQL
-   Neon PostgreSQL
-   Server Actions and/or Route Handlers
-   Zod validation
-   Vercel deployment
-   S3-compatible object storage or Cloudflare R2 for production media
    storage

Authentication may use a mature Next.js-compatible auth solution. Choose
a solution that is production-appropriate and works cleanly with
PostgreSQL/Prisma.

Avoid unnecessary dependencies.

------------------------------------------------------------------------

# 6. ARCHITECTURE

High-level architecture:

``` text
Browser
   ↓
Next.js App
   ↓
Server Components / Server Actions / Route Handlers
   ↓
Authentication + Authorization
   ↓
Domain Services
   ↓
Prisma
   ↓
PostgreSQL / Neon
```

Media:

``` text
Admin uploads media
       ↓
Object Storage
       ↓
media URL/reference stored in PostgreSQL
```

Never store large image/video binaries directly in PostgreSQL.

------------------------------------------------------------------------

# 7. MULTI-TENANCY

The application must be designed as multi-tenant.

Core hierarchy:

``` text
PLATFORM
 └── ORGANIZATION
      ├── USERS
      ├── CHILDREN
      ├── CLASSES
      └── LEARNING DATA
```

Organization types:

``` text
INDIVIDUAL
SCHOOL
TUTOR
LEARNING_CENTER
```

MVP can primarily use `INDIVIDUAL`, but the database must support the
others.

Important rule:

**Organization A must never be able to access Organization B's private
data.**

Every server-side query involving tenant-owned data must verify
organization membership and authorization.

Never trust an organization ID supplied by the browser.

------------------------------------------------------------------------

# 8. USER ROLES

Roles:

``` text
OWNER
ADMIN
TEACHER
PARENT
```

Potential future role:

``` text
SUPER_ADMIN
```

Permissions must be centralized rather than scattered through UI
components.

Create a permissions layer such as:

``` text
src/lib/permissions.ts
```

Example conceptual functions:

``` ts
canManageCourse(user, course)
canManageChild(user, child)
canViewChildProgress(user, child)
canManageOrganization(user, organization)
```

------------------------------------------------------------------------

# 9. CORE PRODUCT HIERARCHY

Content hierarchy:

``` text
Course
  └── Module
       └── Lesson
            └── Activity
                 └── Question
```

Learning hierarchy:

``` text
Organization
  └── Parent
       └── Child
            └── Enrollment
                 └── Lesson Progress
                      └── Attempts
                           └── Skill Mastery
```

Gamification:

``` text
Child
 ├── XP Transactions
 ├── Stars
 ├── Badges
 └── Streak
```

------------------------------------------------------------------------

# 10. INITIAL COURSE

Initial course:

**Counting Fundamentals**

Suggested modules/lessons:

1.  Count and Match
2.  Trace and Match
3.  Count and Circle
4.  Fruits Counting
5.  Count the Fruits
6.  Counting Practice
7.  Match the Same Amount
8.  Counting Objects
9.  Let's Count
10. Fish in the Jar
11. How Many?
12. Dinosaur Counting
13. Number Recognition
14. Extra Counting Practice

The exact worksheet title mapping may be refined during content import.

------------------------------------------------------------------------

# 11. WORKSHEET ASSETS

The supplied worksheet package contains 20 SVG assets.

They are learning/reference assets and must not be hardcoded directly
into React components.

Store initial assets under:

``` text
public/worksheets/
```

Example:

``` text
public/
└── worksheets/
    ├── 1.svg
    ├── 2.svg
    ├── ...
    └── 20.svg
```

Later, production media can move to object storage.

The SVGs should support:

-   printable worksheet access
-   lesson reference
-   preview
-   optional download
-   mapping to interactive activities

Important:

A worksheet is NOT the activity engine.

For example:

``` text
Worksheet: Count and Match

Interactive counterpart:
Show 5 apples
Options:
3
4
5
6

Child selects 5
→ server validates
→ feedback
→ XP
→ progress
```

------------------------------------------------------------------------

# 12. ACTIVITY ENGINE

The LMS must use reusable activity components.

Activity types:

``` text
COUNT_SELECT
COUNT_INPUT
MULTIPLE_CHOICE
DRAG_MATCH
TRACE_NUMBER
COUNT_CIRCLE
SAME_AMOUNT
NUMBER_RECOGNITION
```

Future types can be added.

Create a central renderer:

``` text
ActivityRenderer
```

Concept:

``` tsx
<ActivityRenderer activity={activity} />
```

It selects the appropriate activity component.

Example architecture:

``` text
src/components/activities/
├── ActivityRenderer.tsx
├── CountSelectActivity.tsx
├── CountInputActivity.tsx
├── MultipleChoiceActivity.tsx
├── DragMatchActivity.tsx
├── TraceNumberActivity.tsx
├── CountCircleActivity.tsx
├── SameAmountActivity.tsx
└── NumberRecognitionActivity.tsx
```

Do not create one-off activity implementations inside lesson pages.

------------------------------------------------------------------------

# 13. QUESTION DATA MODEL

Question content must be database-driven.

Do not hardcode questions inside React pages.

Conceptual question structure:

``` json
{
  "prompt": "How many apples?",
  "imageUrl": "/worksheets/apple-example.svg",
  "audioUrl": null,
  "options": [
    { "id": "a", "label": "3" },
    { "id": "b", "label": "4" },
    { "id": "c", "label": "5" }
  ]
}
```

Correct answer must be stored securely.

The client should not receive a trusted scoring value that can simply be
manipulated.

------------------------------------------------------------------------

# 14. SERVER-SIDE SCORING

Never trust:

``` text
score
isCorrect
xp
stars
```

sent from the browser.

The server must calculate correctness.

Flow:

``` text
Child submits answer
        ↓
Authenticate request
        ↓
Verify child access
        ↓
Load question from database
        ↓
Compare answer with correct answer
        ↓
Calculate score
        ↓
Create attempt
        ↓
Update lesson progress
        ↓
Update skill mastery
        ↓
Award XP
        ↓
Return result
```

Example server function:

``` ts
submitAnswer()
```

Expected responsibilities:

1.  Validate input with Zod.
2.  Authenticate user.
3.  Verify parent/child relationship.
4.  Verify question belongs to active lesson.
5.  Load correct answer from database.
6.  Calculate correctness.
7.  Calculate points.
8.  Save attempt.
9.  Update progress.
10. Update skill mastery.
11. Award XP.
12. Return safe result to client.

Use a database transaction where multiple updates must succeed together.

------------------------------------------------------------------------

# 15. SCORING SYSTEM

Initial scoring:

``` text
Correct answer = 10 XP
Incorrect answer = 0 XP
```

Lesson stars:

``` text
90–100% = 3 stars
70–89%  = 2 stars
<70%    = 1 star
```

This is configurable and may later become part of platform settings.

Do not let the browser calculate the authoritative score.

------------------------------------------------------------------------

# 16. LESSON DESIGN

Each lesson should contain approximately:

-   5--10 questions
-   5--10 minutes of learning time

Lesson experience:

``` text
Lesson Intro
   ↓
Question
   ↓
Child Answer
   ↓
Instant Feedback
   ↓
Next Question
   ↓
Lesson Complete
   ↓
Score
   ↓
Stars
   ↓
XP
   ↓
Progress
```

------------------------------------------------------------------------

# 17. CHILD EXPERIENCE

The child-facing interface should be:

-   simple
-   visual
-   friendly
-   large touch targets
-   low text density
-   responsive
-   keyboard accessible where appropriate
-   usable on tablets
-   usable on desktop
-   mobile-friendly

Avoid overwhelming navigation.

Primary child navigation:

``` text
Home
Learn
Progress
Rewards
```

Potential home screen:

``` text
Hi! 👋

Continue Learning
[ Counting Fundamentals ]

Your Progress
██████░░░░ 60%

XP
⭐ Stars
🏅 Badges
```

Avoid excessive animations that hurt performance.

------------------------------------------------------------------------

# 18. PARENT DASHBOARD

Parent dashboard should show:

## Overview

-   Child name
-   Current course
-   Current lesson
-   Overall progress
-   XP
-   Stars
-   Badges
-   Streak

## Learning performance

-   Lessons completed
-   Questions answered
-   Accuracy
-   Strong skills
-   Skills needing practice

## Recommendations

Example:

``` text
Recommended:
Practice counting objects from 1–10
```

Recommendations in MVP can be rule-based.

Do not build AI recommendations yet.

------------------------------------------------------------------------

# 19. SKILL MASTERY

The architecture should support mastery tracking.

Example skills:

``` text
COUNT_1_5
COUNT_1_10
COUNT_1_20
NUMBER_RECOGNITION_1_10
MATCH_QUANTITY
VISUAL_COUNTING
```

Example record:

``` text
Child
Skill
Mastery score
Attempts
Correct attempts
Last practiced
```

Simple MVP mastery calculation can use rolling accuracy.

Example:

``` text
mastery = correctAttempts / totalAttempts
```

Later this can become a more advanced adaptive-learning algorithm.

------------------------------------------------------------------------

# 20. GAMIFICATION

Initial gamification:

### XP

Earned through successful learning.

### Stars

Earned at lesson completion.

### Badges

Examples:

``` text
First Lesson
Counting Starter
5 Lessons Complete
Counting Champion
Perfect Lesson
7 Day Streak
```

### Streak

Track consecutive learning days.

Use a normalized date calculation based on the application's intended
timezone.

Do not create duplicate XP transactions accidentally if a request is
retried.

------------------------------------------------------------------------

# 21. DATABASE DESIGN

Use Prisma + PostgreSQL.

Core models:

``` text
User
Organization
OrganizationMember
Child
Class
ClassMember

Course
CourseModule
Lesson
Activity
Question

Enrollment
Attempt
LessonProgress
SkillMastery

Badge
ChildBadge
XPTransaction

Subscription
```

Future models:

``` text
MediaAsset
Assignment
AssignmentQuestion
AssignmentSubmission
Plan
Payment
AuditLog
```

Important indexes and uniqueness constraints must be added for:

-   organization membership
-   child-parent relationship
-   course/module/lesson ordering
-   attempts by child/question
-   progress by child/lesson
-   mastery by child/skill
-   badge assignment
-   XP transactions

Use foreign keys and cascading rules deliberately.

Do not use arbitrary `string` relationships where a relational foreign
key is appropriate.

------------------------------------------------------------------------

# 22. SUGGESTED PRISMA ENUMS

``` prisma
enum OrganizationType {
  INDIVIDUAL
  SCHOOL
  TUTOR
  LEARNING_CENTER
}

enum UserRole {
  OWNER
  ADMIN
  TEACHER
  PARENT
}

enum ActivityType {
  COUNT_SELECT
  COUNT_INPUT
  MULTIPLE_CHOICE
  DRAG_MATCH
  TRACE_NUMBER
  COUNT_CIRCLE
  SAME_AMOUNT
  NUMBER_RECOGNITION
}

enum Difficulty {
  BEGINNER
  EASY
  MEDIUM
  HARD
}
```

Do not blindly copy this into production without reviewing relations and
constraints.

------------------------------------------------------------------------

# 23. CONTENT MANAGEMENT

Admin must eventually be able to create:

``` text
Course
Module
Lesson
Activity
Question
```

Admin workflow:

``` text
Create course
    ↓
Create module
    ↓
Create lesson
    ↓
Select activity type
    ↓
Create questions
    ↓
Attach media
    ↓
Preview
    ↓
Publish
```

Content states should include:

``` text
DRAFT
PUBLISHED
ARCHIVED
```

Only published content should appear in the normal child learning flow.

------------------------------------------------------------------------

# 24. FUTURE CONTENT BUILDER

The architecture must make a future no-code content builder possible.

Example:

``` text
Question Builder

Activity Type:
[ Count Select ]

Prompt:
[ How many apples? ]

Image:
[ Upload ]

Answers:
○ 3
○ 4
● 5
○ 6

Skill:
[ Count 1–10 ]

Difficulty:
[ Easy ]

[ Save Draft ] [ Publish ]
```

This should be built after the basic LMS engine works.

------------------------------------------------------------------------

# 25. AUTHENTICATION

Authentication must be production-ready.

Requirements:

-   secure password handling if credentials are used
-   session management
-   protected routes
-   server-side authorization
-   logout
-   validation
-   rate limiting where appropriate

Do not rely solely on client-side route guards.

Every sensitive server operation must verify the session.

------------------------------------------------------------------------

# 26. SECURITY

Required security principles:

1.  Never trust client-provided organization IDs.
2.  Never trust client-provided scores.
3.  Never trust client-provided XP.
4.  Never expose correct answers unnecessarily.
5.  Verify child ownership/access server-side.
6.  Verify organization membership server-side.
7.  Validate all external input.
8.  Protect admin endpoints.
9.  Avoid collecting unnecessary child personal information.
10. Use safe database queries through Prisma.
11. Add audit logging for sensitive admin operations later.
12. Do not expose secrets to browser code.
13. Keep secrets in environment variables.
14. Do not commit `.env` files containing secrets.

------------------------------------------------------------------------

# 27. PRIVACY

Because the target audience includes children:

Minimize child data collection.

MVP child profile should preferably require only:

-   display name/nickname
-   avatar
-   optional age band rather than exact birth date

Do not collect unnecessary:

-   address
-   phone number
-   precise location
-   sensitive personal information

Design the product with child privacy as a core principle.

------------------------------------------------------------------------

# 28. PROJECT STRUCTURE

Recommended structure:

``` text
counting-lms/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── worksheets/
│   ├── images/
│   └── audio/
│
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── auth/
│   │   ├── learn/
│   │   ├── parent/
│   │   ├── teacher/
│   │   └── admin/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── activities/
│   │   ├── learning/
│   │   ├── child/
│   │   ├── parent/
│   │   ├── teacher/
│   │   └── admin/
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   ├── scoring.ts
│   │   ├── progress.ts
│   │   └── recommendations.ts
│   │
│   ├── server/
│   │   └── actions/
│   │
│   └── types/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.ts
```

Claude Code may adjust the exact structure if there is a strong
architectural reason, but it must preserve clear separation between:

-   UI
-   domain logic
-   database
-   authorization
-   server actions
-   content
-   activity components

------------------------------------------------------------------------

# 29. ROUTES

Suggested routes:

``` text
/
 /pricing
 /login
 /register

 /learn
 /learn/courses/[courseId]
 /learn/lessons/[lessonId]

 /parent
 /parent/children
 /parent/children/[childId]
 /parent/children/[childId]/progress

 /admin
 /admin/courses
 /admin/courses/[courseId]
 /admin/modules
 /admin/lessons
 /admin/activities
 /admin/questions
 /admin/media

 /teacher
 /teacher/classes
 /teacher/classes/[classId]
```

Do not create all future pages at once.

Implement routes according to the current development phase.

------------------------------------------------------------------------

# 30. API / SERVER ACTION PRINCIPLES

Prefer server actions or route handlers for mutations.

Example:

``` text
createChild()
updateChild()
startLesson()
submitAnswer()
completeLesson()
awardXP()
```

All mutations must:

1.  Authenticate.
2.  Authorize.
3.  Validate.
4.  Perform database operation.
5.  Return typed result.

Never put database credentials or privileged logic in client components.

------------------------------------------------------------------------

# 31. ERROR HANDLING

Create predictable error handling.

Examples:

``` text
Unauthorized
Forbidden
Not Found
Validation Error
Conflict
Server Error
```

Do not expose raw database errors to children or normal users.

Use user-friendly messages.

Example:

``` text
Something went wrong.
Please try again.
```

Detailed errors should be available in server logs.

------------------------------------------------------------------------

# 32. PERFORMANCE

Requirements:

-   Use Server Components by default where appropriate.
-   Use Client Components only where interactivity requires them.
-   Optimize worksheet assets.
-   Lazy-load heavy activity components when useful.
-   Avoid unnecessary client-side state.
-   Avoid unnecessary database queries.
-   Add indexes to high-frequency queries.
-   Use pagination in admin lists.
-   Do not load the entire course library when only one lesson is
    needed.

------------------------------------------------------------------------

# 33. ACCESSIBILITY

Target:

-   keyboard navigation where relevant
-   visible focus states
-   semantic buttons
-   sufficient contrast
-   screen-reader labels
-   large touch targets
-   reduced-motion support
-   no interaction that depends exclusively on color

Children should not be forced to read large amounts of text to complete
an activity.

------------------------------------------------------------------------

# 34. RESPONSIVE DESIGN

The application must work on:

-   desktop
-   laptop
-   tablet
-   mobile

Priority for child experience:

1.  tablet
2.  desktop
3.  mobile

Parent dashboard should work well on desktop and tablet.

------------------------------------------------------------------------

# 35. INITIAL UI DIRECTION

Visual direction:

-   clean
-   modern
-   playful but not childish
-   premium
-   accessible
-   minimal clutter

Avoid:

-   excessive gradients
-   excessive shadows
-   too many colors
-   complicated navigation
-   visual noise

The product should feel like a real education platform rather than a
collection of printable worksheets.

------------------------------------------------------------------------

# 36. MVP DEVELOPMENT PHASES

## Phase 0 --- Foundation

Tasks:

-   Create Next.js application
-   TypeScript
-   Tailwind
-   ESLint
-   Basic folder structure
-   Environment setup
-   Git repository
-   Base UI system

Definition of done:

``` text
npm run dev works
npm run lint works
npm run build works
```

## Phase 1 --- Database

Tasks:

-   Install Prisma
-   Connect PostgreSQL/Neon
-   Create schema
-   Create migrations
-   Seed initial data

Definition of done:

``` text
Database connects successfully.
Prisma migration succeeds.
Seed succeeds.
```

## Phase 2 --- Authentication

Tasks:

-   Register
-   Login
-   Logout
-   Session
-   Protected routes
-   Role checking

## Phase 3 --- Child Profiles

Tasks:

-   Create child
-   Edit child
-   Avatar
-   Child selector

## Phase 4 --- Content Engine

Tasks:

-   Course
-   Module
-   Lesson
-   Activity
-   Question
-   Published/draft states

## Phase 5 --- Interactive Learning Engine

Tasks:

-   ActivityRenderer
-   Count Select
-   Count Input
-   Multiple Choice
-   Match
-   Number Recognition

## Phase 6 --- Learning Data

Tasks:

-   Attempts
-   Progress
-   Scores
-   Skill mastery

## Phase 7 --- Gamification

Tasks:

-   XP
-   Stars
-   Badges
-   Streak

## Phase 8 --- Parent Dashboard

Tasks:

-   progress
-   accuracy
-   skill mastery
-   rewards
-   recommendations

## Phase 9 --- Admin

Tasks:

-   course management
-   lesson management
-   activity management
-   question management
-   publishing

## Phase 10 --- Teacher/Classroom

Future.

## Phase 11 --- Monetization

Future.

## Phase 12 --- AI

Future.

------------------------------------------------------------------------

# 37. INITIAL SEED DATA

Seed at least:

``` text
1 organization
1 admin user
1 parent user
1 child
1 course
3+ modules or logical lesson groups
5+ lessons
Multiple activities
Multiple questions
Multiple skills
Several badges
```

The seed should be deterministic and safe to rerun during development.

Use clearly documented development credentials only.

Never put real production credentials in seed files.

------------------------------------------------------------------------

# 38. TESTING

At minimum test:

### Authentication

-   unauthenticated user cannot access protected pages
-   user cannot access another user's child

### Multi-tenancy

-   organization A cannot access organization B data

### Scoring

-   correct answer gives correct score
-   incorrect answer gives zero
-   client cannot manipulate score

### Progress

-   lesson progress updates correctly
-   duplicate submissions do not incorrectly double rewards

### Gamification

-   XP is awarded once per valid attempt/completion
-   stars calculated correctly
-   badges cannot be duplicated

### Content

-   draft lesson is hidden from child
-   published lesson appears

------------------------------------------------------------------------

# 39. ACCEPTANCE CRITERIA FOR MVP

MVP is considered complete when:

### Parent

-   Can register.
-   Can login.
-   Can create a child.
-   Can select child.
-   Can open Counting Fundamentals.

### Child learning

-   Can open a lesson.
-   Can answer questions.
-   Gets immediate feedback.
-   Gets a final score.
-   Gets stars.
-   Earns XP.
-   Progress is persisted.

### Parent analytics

-   Can see lesson completion.
-   Can see accuracy.
-   Can see XP.
-   Can see stars.
-   Can see badges.
-   Can see basic skill mastery.

### Admin

-   Can create/edit lessons.
-   Can create/edit activities.
-   Can create/edit questions.
-   Can publish content.

### Technical

-   PostgreSQL works.
-   Prisma works.
-   Authentication works.
-   Authorization works.
-   Server-side scoring works.
-   `npm run build` succeeds.
-   No TypeScript errors.
-   No critical lint errors.

------------------------------------------------------------------------

# 40. CLAUDE CODE EXECUTION RULES

Claude Code must follow these rules while implementing this PRD.

## Rule 1 --- Inspect first

Before changing anything:

-   inspect repository
-   inspect package.json
-   inspect existing source
-   inspect environment files
-   inspect Prisma files if present
-   inspect git status

Do not overwrite an existing project blindly.

## Rule 2 --- Work in phases

Do not attempt to build the entire LMS in one giant operation.

Implement one phase at a time.

After each phase:

``` text
typecheck
lint
test where applicable
build
```

Fix errors before moving forward.

## Rule 3 --- No Supabase

Do not install or use:

``` text
Supabase
@supabase/*
```

Database:

``` text
PostgreSQL + Prisma + Neon
```

## Rule 4 --- Do not hardcode learning content

Questions belong in the database.

Do not create:

``` tsx
const questions = [...]
```

inside lesson UI as the production source of truth.

Seed data may contain initial content.

## Rule 5 --- Do not trust client scoring

The client submits an answer.

The server determines:

``` text
correctness
score
XP
stars
progress
mastery
```

## Rule 6 --- Keep business logic out of UI

Avoid putting scoring/progress/business rules directly into React
components.

Use:

``` text
src/lib/
src/server/
```

## Rule 7 --- Reuse components

Do not duplicate activity implementations.

Use:

``` text
ActivityRenderer
```

and reusable activity components.

## Rule 8 --- Keep secrets safe

Never commit:

``` text
.env
.env.local
database passwords
API keys
auth secrets
```

## Rule 9 --- Do not over-engineer MVP

Build the smallest production-quality version that satisfies the
acceptance criteria.

Do not build AI, payments, classrooms, or complex adaptive learning
prematurely.

## Rule 10 --- Explain before destructive changes

If a change would:

-   delete data
-   reset database
-   overwrite major files
-   remove an existing feature

stop and explain the risk before doing it.

------------------------------------------------------------------------

# 41. CLAUDE CODE START PROMPT

Use the following as the first instruction to Claude Code:

``` text
You are the lead software architect and senior full-stack engineer for this project.

Read the entire PRD file before making changes.

Your job is to build the Counting LMS as a serious production-oriented SaaS LMS.

IMPORTANT CONSTRAINTS:
- Do NOT use Supabase.
- Use Next.js App Router + TypeScript + Tailwind CSS.
- Use Prisma + PostgreSQL.
- Target Neon PostgreSQL for hosted database.
- Use production-appropriate authentication.
- Use server-side authorization.
- Use server-side scoring.
- Use Zod for validation.
- Use reusable activity components.
- Keep learning content database-driven.
- Design for multi-tenancy from the beginning.
- Do not build AI or payments before the core LMS is working.

FIRST:
1. Inspect the repository.
2. Inspect package.json.
3. Inspect all existing source files.
4. Inspect git status.
5. Determine what has already been implemented.
6. Compare the current project against this PRD.
7. Create a concise implementation plan.
8. Do NOT make destructive changes.
9. Do NOT install unnecessary packages.

THEN:
Implement only the next logical development phase.

For every phase:
- keep changes focused
- use clean TypeScript
- maintain a clear architecture
- validate server inputs
- enforce authorization server-side
- run typecheck/lint/build
- fix errors before proceeding
- summarize what changed
- list files changed
- state what remains

Never fake a successful implementation.
Never hide errors.
Never skip database migrations.
Never trust client-provided score, XP, stars, or correctness.

The product's core learning loop is:

Child Profile
→ Learning Path
→ Lesson
→ Interactive Activity
→ Answer
→ Server Validation
→ Instant Feedback
→ Score
→ XP/Stars
→ Progress
→ Parent Dashboard

Treat this PRD as the product source of truth unless a technical conflict requires an explicit architectural decision.
```

------------------------------------------------------------------------

# 42. IMPORTANT IMPLEMENTATION ORDER

The recommended order is:

``` text
1. Foundation
2. Database
3. Authentication
4. Child Profiles
5. Course/Lesson/Activity models
6. Interactive activity engine
7. Answer submission
8. Server-side scoring
9. Progress
10. XP/Stars
11. Parent dashboard
12. Admin content management
13. Teacher/classroom
14. Subscriptions
15. AI
```

Do not reverse this order without a clear reason.

------------------------------------------------------------------------

# 43. DEFINITION OF A SERIOUS PRODUCT

This project should not be judged by how many screens it has.

A serious product means:

-   reliable data model
-   secure authorization
-   scalable architecture
-   reusable components
-   testable business logic
-   persistent learning data
-   meaningful analytics
-   content management
-   tenant isolation
-   production deployment capability
-   maintainable code

The goal is to create the foundation of an education SaaS, not merely a
worksheet website.

------------------------------------------------------------------------

# 44. FUTURE ROADMAP

After MVP:

### Version 1.1

-   better parent analytics
-   more counting content
-   improved badges
-   more activity types
-   printable worksheet integration

### Version 1.2

-   teacher accounts
-   classes
-   assignments
-   student analytics

### Version 1.3

-   subscriptions
-   payment
-   organization plans

### Version 1.4

-   adaptive learning
-   personalized recommendations

### Version 2.0

-   AI learning assistant
-   AI content generation for admins
-   additional learning domains
-   school management features

------------------------------------------------------------------------

# 45. FINAL PRODUCT PRINCIPLE

The product must evolve from:

``` text
Worksheet Collection
```

into:

``` text
Interactive Learning Platform
```

and eventually:

``` text
Education SaaS Platform
```

The worksheet assets are the starting content library, not the product
itself.

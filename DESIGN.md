# DESIGN.md — Counting LMS

Source: `docs/PRD.md` §3.2 (child UI), §33 (Accessibility), §34 (Responsive),
§35 (Initial UI Direction). This file documents the *actual* design system
implemented in `src/app/globals.css` and `src/components/ui/*` — it is a
living spec, not aspirational copy. Update it when the system changes.

## 1. Visual Theme & Atmosphere

Counting LMS serves **two audiences on two different surfaces**, and each
gets its own register — the PRD forbids picking only one:

| Surface | Audience | Register |
|---|---|---|
| Marketing home, auth, parent dashboard, teacher/admin | Parents, teachers | **Calm tier** — clean, modern, premium, minimal clutter (PRD §35) |
| `/learn`, lesson player, activities | Children 4–6 | **Play tier** — big, round, colorful, mostly wordless, generous feedback |

One tone word per tier: Calm tier is **trustworthy**. Play tier is
**delighted**. Both share the same token system (§2) so the product still
reads as one brand — the play tier turns the same knobs up (size, radius,
color count, feedback), it does not invent a second brand.

Explicitly out of scope (PRD §35 Avoid, and because the play tier runs on
shared tablets with a 4–6 year old holding it): WebGL/3D, scroll-jacking,
cursor-follow effects, autoplaying background motion, more than one accent
hue per screen. Interaction tier for this product is **L1 (elegant static)
with targeted L2 touches** (scroll-position-independent hover/press
feedback, a hand-built celebration moment on correct answers) — never L3.

## 2. Color Palette & Roles

Defined in `src/app/globals.css` as CSS variables, consumed via Tailwind's
`@theme inline` so every class (`bg-primary`, `text-danger`, …) stays a
variable reference — never a hardcoded hex in component code.

```css
:root {
  --background: #fafaf9;              /* rgb(250,250,249) — page ground, calm tier */
  --foreground: #1c1917;              /* rgb(28,25,23) — body text */
  --surface: #ffffff;                 /* rgb(255,255,255) — cards, opaque chrome */
  --surface-translucent: rgb(255 255 255 / 0.72); /* nav/sheets over scrolled content */
  --border: #e7e5e4;                  /* rgb(231,229,228) */

  --primary: #2563eb;                 /* rgb(37,99,235) — primary actions, links */
  --primary-foreground: #ffffff;
  --accent: #f59e0b;                  /* rgb(245,158,11) — XP, streak, warmth */
  --accent-foreground: #1c1917;
  --topic: #7c3aed;                   /* rgb(124,58,237) — 2nd course/topic tag color */
  --topic-foreground: #ffffff;

  --success: #16a34a;                 /* rgb(22,163,74) — correct answer */
  --danger: #dc2626;                  /* rgb(220,38,38) — incorrect / destructive */
  --muted: #78716c;                   /* rgb(120,113,108) — secondary text */
}
```

Dark mode redefines the same variables under
`@media (prefers-color-scheme: dark)` (see globals.css) — never a second
set of class names. `@media (prefers-contrast: more)` darkens `--border`
for the low-vision case.

**Roles, not free choice:**
- `primary` = the one action per screen you want taken (Mulai Belajar,
  Lanjut, Masuk). Never more than one `primary`-filled element visible at once.
- `accent` = reward/warmth (XP counters, badges, streak flame). Never a
  clickable action's only color.
- `topic` = the *second* hue, reserved for rotating course/category tags in
  the play tier only (`primary`, `topic` alternating by index) — this is
  the one deliberate addition beyond the PRD's existing palette, kept to a
  single new hue so the "too many colors" ceiling still holds.
- `success` / `danger` = feedback only, always paired with an icon or word
  (✓ / ✗, "Benar" / "Coba lagi") — PRD §33 forbids color-only signaling.

## 3. Typography Rules

Font: Geist Sans (already loaded via `next/font/google` in
`src/app/layout.tsx`), system-ui fallback stack. No serif, no display
webfont — one family for both tiers, weight and size carry the difference.

| Token | Size | Leading | Tracking | Use |
|---|---|---|---|---|
| Display (calm) | `clamp(2rem, 5vw, 3.75rem)` | 1.05 | `-0.03em` | Marketing hero H1 |
| H2 (calm) | 1.5–1.875rem | 1.15 | `-0.015em` | Section headings |
| Body (calm) | 1rem | 1.5 | 0 | Paragraphs, forms |
| **Prompt (play)** | `1.875rem` (`text-3xl`) | 1.4 | 0 | The question text a child reads — kept large, never smaller |
| **Option label (play)** | `1.5rem+` (`text-2xl`) | 1.2 | 0 | Answer buttons — numerals/short words only, PRD §33 "not forced to read large amounts of text" |

Rules: `letter-spacing` is negative only on the calm tier's large display
text, never on the play tier (tightened tracking makes numerals/short words
harder for an early reader, not easier). Play-tier text never drops below
`text-2xl` for anything the child must read to act.

## 4. Component Stylings

All in `src/components/ui/`. Every interactive state below is implemented,
not aspirational.

**Button** (`Button.tsx` / `buttonClasses`)
- default: `bg-primary text-primary-foreground rounded-xl`
- hover: `opacity-90`
- active (press): `scale-[0.97]`, 75ms — instant, no delay (kill latency)
- focus-visible: `ring-2 ring-primary ring-offset-2`
- disabled: `opacity-50 pointer-events-none`
- transition: `150ms var(--spring-out)` (`cubic-bezier(0.16,1,0.3,1)`) —
  critically damped, no overshoot; this is a UI button, not a flicked object

**Card** (`Card.tsx`)
- default: `rounded-2xl border border-border bg-surface shadow-sm`
- `translucent` variant: `.material` class (`backdrop-filter: blur(20px)
  saturate(180%)`), used for nav/floating chrome only — never stacked on
  another translucent surface (PRD-adjacent craft rule, not PRD text)

**Answer option button** (play tier, `OptionChoiceActivity.tsx`)
- default: `rounded-3xl border-2 border-border bg-surface`, `h-28`+ (≥44×44px
  touch target, PRD §33, with large margin to spare)
- hover (pointer devices only): `scale-[1.03] border-primary/50`
- press: `scale-[0.96]`, instant
- correct (revealed): `border-success bg-success/10` **+ a ✓ badge** — never
  color alone
- incorrect (selected, revealed): `border-danger bg-danger/10` **+ an ✗
  badge**
- other options once answered: `opacity-40` (de-emphasized, still legible)
- disabled/locked: `opacity-70`, no hover transform

**Badge / topic tag**
- `rounded-full px-3 py-1 text-xs font-medium`, background = role color at
  10–20% opacity, text = the solid role color — never a solid-fill pill for
  a non-interactive label (reserve solid fill for buttons)

## 5. Layout Principles

- Container: `max-w-2xl` for single-column reading/dashboard views,
  `max-w-5xl` for marketing/grid layouts. No wider — PRD asks for minimal
  clutter, not a dashboard sprawling to the viewport edge.
- Spacing scale: Tailwind default (`gap-3/4/6/8`, `py-12/16/20/28`) — no
  bespoke spacing tokens.
- Play tier grids: `grid-cols-2 sm:grid-cols-4` for answer options (never
  more than 4 choices visible at once — PRD keeps the child UI simple),
  `gap-4` minimum so mis-taps on a tablet don't hit the neighboring answer.

## 6. Depth & Elevation

Two levels only, both already restrained per PRD §35 ("avoid excessive
shadows"):
1. **Flat** — bordered, no shadow (`border border-border`) — default for
   cards, options, list rows.
2. **Raised** — `shadow-sm` — reserved for the one primary `Card` per
   section that should read as "the current thing," e.g. the active
   question card in the lesson player.

No third level, no colored shadows, no shadow on hover-lift beyond a 2px
`-translate-y-0.5` (translate, not a bigger shadow, to keep the "no
excessive shadow" rule holding under motion too).

## 7. Animation & Interaction — Tier L1 (+ targeted L2)

Chosen because: PRD §33 requires reduced-motion support and large,
uncomplicated touch targets, the play tier runs on shared tablets in front
of a 4–6 year old (a stray parallax or pin-scroll is a liability, not
delight), and §35 explicitly asks to avoid visual noise. L1 already covers
"elegant hover + soft entrance"; the one L2 addition is a **hand-authored,
one-shot celebration on a correct answer** — not scroll-driven, so it
doesn't trade away performance or predictability.

```css
/* globals.css */
--spring-out: cubic-bezier(0.16, 1, 0.3, 1);   /* default: critically damped */
--spring-press: cubic-bezier(0.34, 1.56, 0.64, 1); /* momentum-only: a flicked/tapped correct answer */

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes gentle-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.celebrate { animation: pop-in 320ms var(--spring-press); }
.shake { animation: gentle-shake 240ms ease-in-out; }

@media (prefers-reduced-motion: reduce) {
  .celebrate, .shake { animation: none; }
}
```

Rules:
- Every transform-based transition/animation has a `prefers-reduced-motion`
  fallback that keeps color/opacity feedback but drops the movement —
  correctness must still be perceivable without motion.
- No animation on page load beyond a single `pop-in` on the *result* of an
  answer (not on every card mount) — an activity screen that animates in
  piece by piece every time is a tax on a child's attention, not delight.
- Press feedback is always instant (0ms delay before the visual starts);
  only the *release* back to rest is eased.

## 8. Do's and Don'ts

**Do:**
1. Route every color through the CSS variables in §2 — no hardcoded hex in
   component files.
2. Pair every success/error state with an icon or word, never color alone.
3. Keep answer buttons ≥44×44px (in practice ≥ h-24) with generous gaps.
4. Keep the play-tier question text at `text-3xl`+ and answer labels short
   (numerals, single words, or a short image) — not sentences.
5. Give press feedback on `pointerdown`/`:active`, not on release.
6. Provide a `prefers-reduced-motion` fallback for every transform animation.
7. Reserve `primary`-filled buttons for exactly one recommended action per
   screen.
8. Keep the calm tier and play tier on the same token set — a new tier is a
   new *usage* of existing tokens, not a new palette.

**Don't:**
1. Don't add a third accent hue beyond `primary`/`accent`/`topic` — PRD
   explicitly caps color count.
2. Don't use `backdrop-filter` blur above ~20px or stack two translucent
   surfaces — legibility collapses (see apple-design skill notes already
   applied to the nav).
3. Don't require reading more than a short phrase to complete a play-tier
   interaction.
4. Don't add scroll-jacking, pinned sections, or WebGL — explicitly ruled
   out for this product (§1).
5. Don't animate every element on mount; animate outcomes (an answer being
   right), not arrivals.
6. Don't make a course/topic tag a solid-fill pill — that visual is
   reserved for actionable buttons.
7. Don't drop the ✓/✗ badge on answer feedback even when the color change
   alone "looks obviously right" to a sighted adult tester.

## 9. Responsive Behavior

Breakpoints: Tailwind defaults (`sm`, `md`, `lg`) — no custom breakpoints.

PRD §34 priority order:
- **Play tier (`/learn`, lesson player, activities):** designed first for
  **tablet** width (≈768–1024px) — answer grid is `grid-cols-2` under
  `sm`, `grid-cols-4` at `sm`+, so it never gets cramped below tablet width
  either. Desktop is the same layout, centered with a max-width. Phone-width
  works (grid-cols-2, larger touch targets still fit) but is the third
  priority, not the design target.
- **Calm tier (marketing, parent dashboard):** desktop + tablet first,
  phone-width verified (nav collapses to just the two auth buttons, hero
  and cards stack to one column at `<sm`).
- Touch targets ≥44×44px everywhere; verified on the play tier's answer
  buttons (`h-28`) and every `Button` size (`sm`=36px is calm-tier only,
  never used inside an activity).

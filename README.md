# 🐾 Pet Companion

A frontend-only MVP that helps pet owners stop realizing *too late* that the food bag is
empty — the classic pet-store problem. Pet Companion combines a multi-pet care dashboard
(food stock, estimated run-out date, next vet visit) with a cute, interactive 3D cat
avatar you can spin around and dress up.

**The product problem:** owners buy a bag of food, forget how fast it disappears, and run
out at 9pm on a Sunday. This MVP tracks how much food is left, estimates the day it runs
out, and surfaces one clear status so the owner can restock in time.

## Setup & commands

Requires Node.js (built and verified with Node 26 / npm 11).

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
npm run test       # run the Vitest unit tests once
npm run lint       # ESLint
npm run typecheck  # tsc -b (no emit)
```

## Tech stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **three + @react-three/fiber + @react-three/drei** for the 3D avatar
- **Vitest** for unit tests of the food calculations
- **ESLint** (flat config with typescript-eslint, react-hooks, react-refresh)
- **@fontsource/nunito** — self-hosted font, works offline

## Project structure

```
src/
├── types/index.ts                 # Pet, AvatarConfig, FoodStock, CareEvent, Species
├── lib/
│   ├── food-calculations/         # pure, UI-independent food math (+ Vitest tests)
│   ├── storage/                   # LocalStorage load/save, schema version, guards, seed
│   ├── status.ts                  # derives ONE pet status (priority-ordered)
│   └── age.ts                     # age/date formatting helpers
├── hooks/
│   ├── usePets.tsx                # PetsProvider: state + LocalStorage sync
│   ├── pets-context.ts            # context + usePets hook
│   ├── useReducedMotion.ts        # prefers-reduced-motion
│   └── useWebGLSupport.ts         # WebGL availability detection
├── components/
│   ├── dashboard/                 # Dashboard, PetSummary, StatusBanner, QuickActions,
│   │                              # FoodCard, CareCard
│   ├── pets/                      # PetSwitcher, PetForm (modal), EmptyState
│   ├── avatar/                    # AvatarCanvas, CatModel, AvatarCustomizer,
│   │                              # AvatarFallback, AvatarErrorBoundary
│   └── ui/Modal.tsx               # accessible modal (Escape/backdrop close)
├── App.tsx
└── main.tsx
```

## Food-calculation assumptions

All food logic lives in `src/lib/food-calculations/` as pure functions and is covered by
unit tests (`npm run test`).

- **Units.** Stock is entered in grams or kilograms and always converted to grams
  (`1 kg = 1000 g`). Consumption is always grams per day.
- **Days remaining** = `stockGrams / dailyConsumptionGrams`. Fractional days are kept.
- **Run-out date** = the date the stock figure was recorded (`food.updatedAt`) plus the
  days remaining. Saving the food form re-stamps `updatedAt`, so the estimate always
  anchors to "when you last checked the bag".
- **Thresholds.** Food is *low* at ≤ 5 days remaining
  (`LOW_STOCK_THRESHOLD_DAYS`). A care date counts as *upcoming* within 14 days
  (`UPCOMING_CARE_WINDOW_DAYS`).
- **Missing data is never guessed.** If the stock or the consumption is missing, zero,
  negative, or not a finite number, the functions return `null` / status `'unknown'`
  and the UI asks for the data instead of inventing an estimate.
- **Statuses:** `exhausted` (stock is exactly 0), `overdue` (the estimated run-out date
  computed from the last stock update is already in the past — the recorded stock is
  stale), `low`, `ok`, `unknown`.
- **Banner priority** (one status at a time, documented in `src/lib/status.ts`):
  exhausted/overdue > low food > upcoming care > missing data > ok.

## Avatar implementation notes

- The cat is **fully procedural and original**, built at runtime from three.js
  primitives (spheres, cones, cylinders, torus segments) via React Three Fiber in
  `src/components/avatar/CatModel.tsx`. There are **no external models, textures, or
  HDR environments**, so there are no third-party licensing concerns and everything
  works offline.
- Lighting is plain three.js lights (ambient + two directionals) with soft shadows and a
  simple ground disc — no HDR downloads.
- **OrbitControls**: full 360° azimuth rotation with mouse and touch, polar angle clamped
  (0.9–1.6 rad) so you can't go under the floor, zoom clamped, damping enabled, plus a
  "Reset view" button that restores the camera.
- **Idle animation** (`useFrame`): gentle breathing, slow tail sway, occasional blink.
  All animation is disabled when the OS reports `prefers-reduced-motion: reduce`.
- **Fallbacks:** if the browser can't create a WebGL context, a styled static card is
  shown instead (customization choices still save). A React error boundary around the
  Canvas guarantees a 3D runtime failure can never block the rest of the dashboard.
- Customization (4 fur colors, 3 eye colors, collar+bell, bow) applies live and is stored
  per pet.

## Data storage

This is a prototype: **all data lives only in your browser's LocalStorage** under the key
`pet-companion:v1`. There is no backend, no account, no sync. Stored data is validated
with type guards on load — corrupt or outdated content falls back to seeded sample data
(Mochi the cat) instead of crashing. "Reset sample data" in the header restores Mochi.

## Non-goals (explicitly out of scope)

- Shop / ordering food
- Communities / social features
- Vet consultation, prescriptions, medical records
- Backend, authentication, payments, push notifications
- Photo-generated or AI-generated avatars
- Any external AI services

## Roadmap ideas

- Restock reminders (local notifications / PWA push)
- Consumption history and automatic consumption-rate estimates
- More species avatars (dog, rabbit, bird) built the same procedural way
- PWA install + offline shell
- Multiple food types per pet (dry/wet/treats)

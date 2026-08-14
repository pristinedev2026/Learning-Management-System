# LMS Mobile App (Expo + React Native + TypeScript)

Student/instructor learning management app for an open, self-enroll online
course platform. Originally built against a mocked API layer; `src/services/api.ts`
now calls a real NestJS + PostgreSQL (Neon) backend — see `../backend` — over
HTTP instead. Everything above the service layer (React Query hooks,
screens, components) was left untouched, since the mock layer was written
with real swap-in in mind from the start.

## Connecting to the backend

1. Get the backend running first — see `backend/README.md`.
2. Copy `.env.example` to `.env` in this project and set `EXPO_PUBLIC_API_URL`
   to wherever your backend is reachable from your phone/emulator (not
   `localhost` — your phone can't see your PC's localhost). See the comments
   in `.env.example` for the right value depending on physical phone vs.
   Android emulator vs. iOS simulator.
3. Restart `npx expo start` after creating/changing `.env` — Expo only reads
   `EXPO_PUBLIC_*` vars at startup, not on hot reload.
4. Demo accounts are now real accounts seeded in Postgres by the backend's
   seed script: `091122332` (student), `091122331` (instructor), and
   `091122330` (admin), all with password `password123`. Login is by
   phone number, not email.

## What's implemented (build step 1 + start of step 3)

- Project scaffold, TypeScript strict mode, path alias (`@/*` → `src/*`)
- Full navigation shell: auth stack, role-gated root navigator, student
  bottom tabs (with nested catalog stack), instructor bottom tabs, admin
  bottom tabs (user management)
- Auth flow: Login (by phone number, with success/failure alerts), Sign Up
  (with role selection), Forgot Password (points users to their
  administrator — there's no self-service reset), forced Change Password
  screen (shown when an admin has reset or flagged an account) — wired to
  the mock API and a Zustand session store persisted via SecureStore
- Theme tokens (`src/theme/tokens.ts`) — colors, spacing, type scale,
  shadows, tap targets — no hardcoded hex values in components
- Mock data + mock API service layer + React Query hooks
- Student: Course Catalog (search + FlatList), Course Detail
  (syllabus/enroll), My Courses (progress bars)
- Instructor: Dashboard (course stats)
- Reusable components: Button, Card, Tag, ProgressBar — all accessible
  (roles, labels, min tap targets)
- Unit tests for the two pieces of logic the brief calls out explicitly:
  - Quiz auto-grading — now lives and is tested on the backend
    (`backend/src/quizzes/grading.ts`), since grading needs to be
    server-authoritative once there's a real API. Ported 1:1 from what
    used to be here.
  - `src/utils/grades.ts` → `calculateCourseGrade` (grade calculation) —
    still client-side, still tested here

Screens not yet built (lesson viewer, assignment submission, quiz taker,
course/lesson editor, grading queue, gradebook, announcements, messaging,
calendar, notifications, offline caching) render as labeled placeholders
so the navigation shell is fully clickable end to end. They map to build
steps 4–10 in the original brief.

## Getting started

```bash
npm install
npm start        # then press i for iOS simulator, a for Android emulator
```

Demo accounts (login is by phone number against the real backend):

- `091122332` / `password123` → student experience
- `091122331` / `password123` → instructor experience
- `091122330` / `password123` → admin experience (reset/force-change
  any user's password)

## Running tests

```bash
npm test
```

## Project structure

```
src/
  components/     # Button, Card, Tag, ProgressBar — reusable, theme-driven
  mocks/          # in-memory mock dataset
  navigation/      # AuthStack, StudentTabs, InstructorTabs, RootNavigator
  screens/
    auth/
    student/
    instructor/
  services/       # api.ts (mock REST client), queries.ts (React Query hooks)
  store/          # authStore.ts (Zustand)
  theme/          # tokens.ts
  types/          # shared TypeScript interfaces matching the data model
  utils/          # grades.ts (pure grade-calculation logic)
```

## Next steps (in brief's suggested order)

4. Student: assignment submission + quiz taker
5. Instructor: course/module/lesson editor
6. Instructor: assignment + quiz editor
7. Instructor: submissions inbox + grading flow, gradebook
8. Student: grades view, calendar, notifications
9. Wire up real API layer once backend contract is confirmed
10. Announcements, discussion/messaging, offline caching

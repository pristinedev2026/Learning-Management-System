# LMS Backend (NestJS + Prisma + PostgreSQL/Neon)

REST API backing the LMS mobile app. Auth is JWT-based; roles (`student` /
`instructor`) are embedded in the token and enforced with a `RolesGuard`.

## 1. Setup

```bash
cd backend
npm install
```

`.env` is already filled in with the Neon connection string you provided.
**Rotate that database password in the Neon console** once you've confirmed
everything works — it was shared in plaintext in a chat session, so treat it
as compromised. Also replace `JWT_SECRET` in `.env` with a real random value:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 2. Create the schema in Neon

```bash
npm run prisma:migrate -- --name init
```

This creates all tables in your Neon database and generates the Prisma
client. If you ever change `prisma/schema.prisma`, re-run this command with
a new `--name`.

## 3. Seed demo data

```bash
npm run prisma:seed
```

Creates the same demo accounts and course the mobile app's mock layer had.
Login is by phone number, not email:

- `091122330` / `password123` (admin)
- `091122332` / `password123` (student)
- `091122331` / `password123` (instructor)

## 4. Run the API

```bash
npm run start:dev
```

Runs on `http://localhost:3000/api` with hot reload. `npm run prisma:studio`
opens a GUI browser for the Neon database if you want to inspect data.

## Connecting the mobile app to this instead of the mock layer

The mobile app's `src/services/api.ts` was written from day one so its
function signatures wouldn't need to change when a real backend showed up —
see the updated mobile app zip, where that file now calls this API over
HTTP instead of returning in-memory mock data.

Since your phone/emulator can't reach `localhost` on your PC, set
`EXPO_PUBLIC_API_URL` in the mobile app to your machine's LAN IP, e.g.
`http://192.168.1.42:3000/api` (find your IP with `ipconfig` on Windows).
If you're using an Android emulator specifically, `http://10.0.2.2:3000/api`
routes to your host machine automatically. Full detail is in the mobile
app's README.

## API reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ name, phone, email?, password, role }` |
| POST | `/api/auth/login` | — | `{ phone, password }` → `{ accessToken, user }` |
| GET | `/api/auth/me` | Bearer | Current user from token |
| PATCH | `/api/auth/change-password` | Bearer | `{ newPassword }` — self-service; also completes an admin-forced reset |
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users/:userId/reset-password` | Admin | `{ newPassword }` — sets a new password without knowing the old one; user must change it again at next login |
| POST | `/api/admin/users/:userId/force-password-change` | Admin | Flags the account so the user must set a new password at next login |
| GET | `/api/courses?search=` | — | Public catalog |
| GET | `/api/courses/:id` | — | Course detail with modules/lessons |
| GET | `/api/courses/instructor/:instructorId` | — | Courses by instructor |
| POST | `/api/courses` | Instructor | Create course |
| PATCH | `/api/courses/:id` | Instructor (owner) | Update course |
| DELETE | `/api/courses/:id` | Instructor (owner) | Delete course |
| POST | `/api/courses/:id/modules` | Instructor (owner) | Add module |
| POST | `/api/courses/:id/modules/:moduleId/lessons` | Instructor (owner) | Add lesson |
| GET | `/api/enrollments/me` | Student | My enrollments |
| POST | `/api/enrollments` | Student | `{ courseId }` |
| GET | `/api/courses/:courseId/assignments` | — | List assignments |
| POST | `/api/courses/:courseId/assignments` | Instructor (owner) | Create assignment |
| POST | `/api/assignments/:assignmentId/submit` | Student | `{ content? , fileUrl? }` |
| GET | `/api/assignments/:assignmentId/my-submission` | Student | My submission status |
| GET | `/api/courses/:courseId/submissions` | Instructor (owner) | Grading queue |
| POST | `/api/submissions/:submissionId/grade` | Instructor (owner) | `{ score, feedback? }` |
| GET | `/api/courses/:courseId/quizzes` | — | List quizzes |
| POST | `/api/courses/:courseId/quizzes` | Instructor (owner) | Create quiz with questions |
| POST | `/api/quizzes/:quizId/attempts` | Student | `{ answers }` → auto-graded |
| GET | `/api/quizzes/:quizId/my-attempt` | Student | My attempt/score |
| GET | `/api/courses/:courseId/announcements` | — | List announcements |
| POST | `/api/courses/:courseId/announcements` | Instructor (owner) | `{ title, body }` |

## Testing

```bash
npm test
```

Covers the quiz auto-grading logic (`src/quizzes/grading.ts`), ported
directly from the mobile app's tested implementation so both sides agree on
how a quiz is scored.

## Known gaps to close before any real deployment

- Quiz endpoints currently return `correctAnswer` to students fetching a
  quiz to take — fine for a dev/demo build, but before shipping you'd want
  a student-facing serializer that strips answers until after submission.
- File uploads (`fileUrl` on submissions) assume a URL from some other
  upload step (e.g. S3/Cloudinary/Expo's own storage) — this backend
  doesn't handle file storage itself yet.
- CORS is wide open (`app.enableCors()` with no options) for local dev;
  restrict it to your app's actual origin before deploying.
- No refresh-token rotation — the JWT is a flat 7-day token. Fine for a
  student project, worth revisiting for production.

### BigBrain Project README (Production-Oriented)

A real-time quiz application built with React + Vite. The frontend offers admin game management (auth, game creation/import, session control, analytics) and a player experience (join, wait room with a mini-game, timed answering, results). The backend exposes authentication, game CRUD, session control, and results APIs, designed for Vercel serverless deployment with Upstash Redis storage.

---

## Features

- Admin
  - Login / Register / Logout (JWT stored in localStorage)
  - Dashboard to view and search games
  - Create games (supports importing full quiz via .json including thumbnail)
  - Start / Advance / End sessions; prompt to view results after ending
  - Results and analytics:
    - Top 5 ranking (custom scoring: Points x Speed)
    - Per-question correct rate (bar chart)
    - Per-question average response time (line chart)
    - User accuracy ranking, fastest responder per question
    - Export Top 5 as CSV

- Player
  - Join by session ID (supports deep link with session prefilled)
  - Waiting room with a Snake mini-game
  - Timed answering with media support
    - YouTube link auto-embed; or display uploaded images
  - Shows correct answers when time is up
  - Redirect to personal result view when session ends

- UX & Visuals
  - React Router with scroll-to-top and a floating back-to-top button
  - MUI + Ant Design components + notistack toast notifications
  - Recharts for charts, framer-motion animations, react-tsparticles background

---

## Tech Stack

- Frontend: React 18, Vite, React Router, MUI, Ant Design, notistack, Recharts, framer-motion, react-tsparticles
- Testing: Vitest + React Testing Library (components), Cypress (E2E)
- Backend: Express (Vercel Serverless), JWT, Upstash Redis
- Deployment: Vercel (frontend/backend as separate projects or subfolders)

---

## Structure (Key)

- `frontend/`
  - `src/`
    - `components/`: login, register, dashboard, session control, player views
    - `sessionAPI.jsx`: admin session-related API helpers
    - `backendURL.js`: backend base URL (switch here for prod/dev)
    - `__test__/`: component tests
  - `vite.config.js`: dev port 3000 and Vitest setup
  - `package.json`
- `backend/`
  - `src/server.js`: Express app & routes
  - `src/service.js`: business logic, JWT, Upstash Redis read/write
  - `api/index.js`: Vercel entry
  - `swagger.json`: OpenAPI spec (available under `/docs`)
  - `vercel.json`: Vercel builds & routes

---

## Local Development

Prereqs: Node.js >= 18, npm >= 9.

1) Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

2) Backend connection

- Frontend points to deployed backend by default: `frontend/src/backendURL.js`
  - For local backend, change it to: `http://localhost:5005`
- Current backend is designed for Vercel Serverless; if you run an alternative local backend, ensure routes match and update `backendURL.js` accordingly.

---

## Deployment

- Frontend
  - Import repo into Vercel; set root directory to `frontend`
  - Deploy and optionally customize domain (can include your identifier/zID)

- Backend
  - Import repo into Vercel; set root directory to `backend`
  - Keep `vercel.json` and `api/index.js` (no explicit `app.listen`)
  - Configure environment variables (see below)

---

## Environment Variables (Backend)

The backend uses Upstash Redis. Configure these in Vercel Project Settings:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Notes:
- On startup, the service attempts to read `admins`, `games`, `sessions` from Redis; if absent, it initializes and persists empty structures.
- All mutations (create games, session progress) persist to Redis.

---

## API & Docs

- Swagger/OpenAPI: visit backend root to be redirected to `/docs`
- Key endpoints (partial):
  - Auth: `POST /admin/auth/register`, `POST /admin/auth/login`, `POST /admin/auth/logout`
  - Games: `GET /admin/games`, `PUT /admin/games`, `POST /admin/game/:gameid/mutate` (START/ADVANCE/END)
  - Session: `GET /admin/session/:sessionid/status`, `GET /admin/session/:sessionid/results`
  - Player: `POST /play/join/:sessionid`, `GET /play/:playerid/status`, `GET /play/:playerid/question`, `PUT/GET /play/:playerid/answer`, `GET /play/:playerid/results`

---

## Quiz JSON Import (Frontend)

Use Dashboard → “Create New Game” to import a `.json`. Frontend validates each question fields:

- Required fields per question:
  - `question`: string
  - `optionAnswers`: string[]
  - `correctAnswers`: number[] (indexes referring to `optionAnswers`)
  - `duration`: number (seconds)
  - `points`: number
  - `type`: string (`single` | `multiple` | `judgement`)
  - `media`: string (media URL or base64 image)
  - `mediaMode`: string (`url` | `image`)
  - `imageUploaded`: boolean
  - `imageData`: string (base64 for `mediaMode = image`)

Example (simplified):

```json
{
  "name": "Sample Game",
  "thumbnail": "data:image/png;base64,....",
  "questions": [
    {
      "question": "Which are prime numbers?",
      "optionAnswers": ["2", "3", "4", "5"],
      "correctAnswers": [0, 1, 3],
      "duration": 20,
      "points": 10,
      "type": "multiple",
      "media": "",
      "mediaMode": "url",
      "imageUploaded": false,
      "imageData": ""
    }
  ]
}
```

Backend correctness check: compares sorted arrays of `correctAnswers` and submitted answer indexes for equality.

---

## Frontend Scripts

From `frontend/package.json`:

- `npm run dev` start dev server (port 3000)
- `npm run build` build production assets
- `npm run preview` preview production build
- `npm run lint` run ESLint
- `npm run test` run component tests (Vitest)

## Testing

- Component tests (Vitest + RTL)
  - Location: `frontend/src/__test__`
  - Run:
    ```bash
    cd frontend
    npm install
    npm run test
    ```

- E2E tests (Cypress)
  - Location: `frontend/cypress/e2e`
  - Run:
    ```bash
    cd frontend
    npm install
    npx cypress open
    # Dev server should be running at http://localhost:3000
    ```

---

## Key Routes

- `/login` Login (with captcha; `AAAA` bypass in development)
- `/signup` Register (captcha + confirm password)
- `/dashboard` Admin dashboard (create/search/import games)
- `/game/:game_id`, `/game/:game_id/question/:question_id` Edit & manage
- `/game/:game_id/session/:session_id` Session control and analytics
- `/play` Player join (or `/play/session/:sessionId` deep link)
- `/play/session/:sessionId/player/:playerId/game` Player gameplay
- `/play/session/:sessionId/player/:playerId/result` Player results

---

## Notes

- If you change the backend URL, update `frontend/src/backendURL.js`
- Production:
  - Ensure Upstash env vars are set on backend
  - Prefer HTTPS-only APIs
- Scoring in Top 5: per-question score = Points × Remaining Time Ratio (normalized by 60s); total = sum across questions

---

## License

Intended for course/learning and demonstration purposes. Unless a license is explicitly provided, all rights reserved.



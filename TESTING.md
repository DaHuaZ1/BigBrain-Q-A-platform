# TESTING.md

## Component Testing

We implemented unit tests for at least 6 distinct components using React Testing Library. Each test is designed to validate critical logic, edge cases, or visual outputs without overlap in functionality.

### ✅ CanvasCaptcha.test.jsx

- Mocks canvas context rendering.
- Validates the presence of captcha canvas in the DOM.

### ✅ GameJoinPage.test.jsx

- Verifies error messages are triggered if player does not enter name or session ID.
- Covers user input validation logic.

### ✅ GameCard.test.jsx

- Checks rendering of game card title and contents.
- Differentiates between active and inactive game states.

### ✅ GameSnake.test.jsx

- Confirms canvas and score are rendered.
- Mocks canvas 2D API methods to simulate drawing logic.

### ✅ Bar.test.jsx

- Verifies logout button is shown if token is present.
- Validates login/signup links when no token exists.

### ✅ SessionPage.test.jsx

- Ensures control UI is displayed correctly for session management.

---

## UI Testing

We used Cypress to implement both a full “admin flow” and an alternate “player error path.”

### 🧪 adminHappyPath.cy.js

Covers:

- Registration with captcha bypass
- Dashboard access via token
- Game creation modal interaction
- Session start & end logic
- Result viewing modal flow
- Logout + login again

✅ This test was implemented in a **single test block** to maintain token/session context between steps and ensure stability.

### 🧪 playerAlternatePath.cy.js

Covers:

- Player joins a session that doesn't exist
- Application throws a handled error (`Session ID is not an active session`)
- Cypress intercepts the uncaught exception and allows test to assert alert behavior

### Rationale for Alternate Path:

The player-facing interface is heavily dependent on an admin starting a session and advancing questions. To avoid unnecessary complexity and dependency on real-time coordination, we chose to test an invalid session path. This:

- Validates error handling and user feedback
- Simulates common real-world error
- Ensures user experience is resilient without admin cooperation

---

## How to Run the Tests

### ✅ Component Testing

We used **Vitest** and **React Testing Library** for component testing.

To run the tests:

```bash
cd frontend
npm install
npm run test
```

> If prompted, press `a` to run all tests.

Tests are located under `frontend/src/__test__`.

---

### ✅ UI Testing

We used **Cypress** for end-to-end UI testing.

To run Cypress tests:

```bash
cd frontend
npm install
npx cypress open
```

- In the Cypress UI that opens, select either:
  - `adminHappyPath.cy.js` (full admin flow)
  - `playerAlternatePath.cy.js` (alternate error path)

Cypress may require a local development server to be running at `http://localhost:3000`. To start it:

```bash
npm run dev
```

> Cypress tests depend on a working backend and database (mock or real). The `adminHappyPath` test creates a game dynamically, so you don't need to pre-create any game manually.

---

## Note on Environment

The frontend assumes development mode (`import.meta.env.MODE === "development"`) for bypassing captcha in tests.

Please ensure the app is started with `npm run dev` before running Cypress.
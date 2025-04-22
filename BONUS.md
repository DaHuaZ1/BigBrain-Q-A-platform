# BONUS Features (Implemented by Yuxin)

## CAPTCHA on Login & Register
- When users register or log in, a visual CAPTCHA (e.g. "P5VZ") 
- The CAPTCHA includes distortion to make recognition harder for machines.
- Implemented on the frontend only
- Idea inspired by [Bilibili tutorial](https://www.bilibili.com/video/BV1T64y1f7kM), but all actual code was written from scratch.

## Snake Game While Waiting
- When players wait for the admin to start the game, they're shown a waiting screen.
- I added a simple Snake game ("Try Snake!") by using canvas to improve the waiting experience.
- The game logic references [YouTube tutorial](https://www.youtube.com/watch?v=Je0B3nHhKmM) and was rewritten to fit the project requirements.


# BONUS Features (Implemented by Mingxuan)

## User Ranking & Visual Enhancements

### 🏆 User Answer Accuracy Ranking
- A leaderboard that ranks users based on their overall answer accuracy.
- Recalculates after each game session and highlights consistent top performers.

### ⚡ Fastest Answerers per Question
- For each question in a session, the fastest user to answer correctly is logged.
- Displayed as a mini leaderboard under each question in the results modal.

### 🎖️ Achievement Badge System (Top 5 Users)
- Top 5 performers receive badges (Gold, Silver, Bronze, etc.).
- Badges persist across sessions.

### 📥 Download Ranking Button (Top 5)
- A button is added to allow downloading the top 5 users’ rankings in `.csv` format.
- Located in the session results modal and session detail view.

## UI/UX Enhancements

### 🎮 Game Card Animation
- Game cards now appear with a staggered animation.
- Each card slides in from the top with a fade-in effect, enhancing visual flow.

### 📄 Game Card Detail View
- Game cards can now be expanded to reveal game configuration and metadata.
- Includes information like number of questions, detail of each question, game difficulty.

### 🕒 Past Sessions Animation
- Each past session on the history page is animated in with a delayed fade-in.
- Adds a sense of progression when viewing session history.

### 👀 Mouse-Following Eyes on Header Bar
- A pair of eyes added to the header bar follows the cursor in real-time.
- Created using dynamic SVG manipulation based on `mousemove` events.

### ⬆️ Scroll-to-Top Button
- A floating button appears in the bottom-right corner after scrolling down.
- Smoothly scrolls the page back to the top when clicked.

### ⏰ Time-based Greeting on Home Page
- The Home Page now displays a dynamic greeting based on the user's local time.
- Morning (before 12pm): "Good Morning, Commander!"
- Afternoon (12pm–6pm): "Good Afternoon, Commander!"
- Evening (after 6pm): "Good Evening, Commander!"
- Implemented using JavaScript `Date` API and rendered using `Typography` component.
- Ensures the greeting remains visible even after rerenders by storing it in `localStorage`.

### 🔍 Game Search with Styled Input
- A live search feature is added to the Dashboard to help users find games by name.
- As users type in the search box, the displayed GameCards are filtered in real time.
- The search input is styled as a sleek, pill-shaped (rounded) bar with a search icon prefix.
- Implemented using `TextField` with `InputAdornment` and custom `sx` styles from MUI.
- The UI blends seamlessly into the dashboard layout while improving usability and aesthetics.
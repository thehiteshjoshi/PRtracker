[README.md](https://github.com/user-attachments/files/28159884/README.md)
FitTrack — Personal Workout Tracker

A mobile-first fitness tracking app to log workouts, track lifts, and visualize progress over time. Built with React and Recharts. Fully offline — no login, no cloud, no BS.

---

Features

- **Log any workout** — Strength, Bodyweight, and Cardio support
- **Custom exercise library** — Create your own exercises, reuse them every session
- **Set / Rep / Weight logging** with automatic 1RM calculation (Epley formula)
- **Progress graphs** — Red line charts showing weight, 1RM, or volume over time
- **Progress tables** — Sortable data by Week / Month / Year
- **Session history** — Full log of every past workout, expandable per session
- **Stats dashboard** — Total sessions, weekly activity, most trained exercise, personal records
- **100% offline** — All data stored locally in the browser (localStorage / AsyncStorage)

---

Tech Stack
| Framework | React (web) / React Native Expo (mobile) |
| Charts | Recharts (web) / Victory Native (mobile) |
| Storage | localStorage (web) / AsyncStorage (mobile) |
| Styling | Inline CSS with dark/red theme |
| Font | DM Sans (Google Fonts) |


Running Locally (Web)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/fittrack.git
cd fittrack

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Running on Android (Expo)

```bash
# 1. Install Expo CLI
npm install -g expo-cli

# 2. Create a new Expo project
npx create-expo-app FitTrack
cd FitTrack

# 3. Install dependencies
npx expo install @react-native-async-storage/async-storage
npx expo install victory-native

# 4. Replace App.js with the source code
# (swap localStorage → AsyncStorage, div → View, p → Text)

# 5. Start the dev server
npx expo start

# 6. Scan the QR code with Expo Go on your Android phone
```

---

## 📂 Project Structure

```
fittrack/
├── App.jsx              # Main app — all screens and logic
├── README.md
└── package.json
```

---

How 1RM is Calculated

Uses the Epley Formula

```
1RM = weight × (1 + reps / 30)
```

Automatically calculated from the heaviest set logged per session. Can also be entered manually.

---

Data Model

All data is stored as JSON in localStorage:

```json
// exercises
[{ "id": "abc123", "name": "Bench Press", "category": "Strength", "loggingType": "sets_reps" }]

// sessions
[{
  "id": "xyz789",
  "date": "2026-05-23T00:00:00.000Z",
  "exercises": [{
    "exerciseId": "abc123",
    "name": "Bench Press",
    "category": "Strength",
    "sets": [{ "reps": 8, "weight": 80 }, { "reps": 6, "weight": 85 }],
    "oneRM": 102.8
  }]
}]
```

---

Deploying to Vercel (Free)

```bash
# 1. Push your code to GitHub

# 2. Go to vercel.com → New Project → Import your repo

# 3. Click Deploy — done. You get a live URL instantly.
```

---

Roadmap

- [ ] Rest timer between sets
- [ ] Export data as CSV
- [ ] Workout streak tracking
- [ ] Muscle group tagging per exercise
- [ ] Dark/light theme toggle

---


Built by 
[GitHub](https://github.com/thehiteshjoshi) · [LinkedIn](www.linkedin.com/in/hitesh-joshi-002810373)

---

## 📄 License

MIT — free to use, modify, and distribute.

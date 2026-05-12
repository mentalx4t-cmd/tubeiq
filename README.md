# TubeIQ

Professional AI-powered YouTube SEO and optimization suite. Features channel analytics, keyword and topic research, smart video uploads, and automated content auditing.

## Features

- 📊 **Dashboard** — Channel stats, subscriber count, recent video performance
- 💡 **Daily Ideas** — AI-generated video titles, hashtags, and SEO keywords
- 🔥 **Trending** — Browse trending videos by country and category
- ⬆️ **Upload** — AI-optimized metadata + direct YouTube upload
- 🛡 **Audit** — Full SEO audit with SWOT analysis and checklist
- 🤖 **Chat** — Floating AI SEO assistant

---

## Deploy to GitHub + Netlify

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tubeiq.git
git push -u origin main
```

### 2. Connect Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Pick your GitHub repo
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 3. Set Environment Variables in Netlify

Go to **Site → Configuration → Environment Variables** and add:

| Variable | Where to find it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Project Settings |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Console → Project Settings |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Firebase Console → Firestore (use `(default)` if unnamed) |

After adding variables, trigger a redeploy: **Deploys → Trigger deploy**.

### 4. Add Netlify Domain to Firebase Auth

In **Firebase Console → Authentication → Settings → Authorized domains**, add your Netlify URL:

```
your-site-name.netlify.app
```

Also add any custom domain you configure.

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/tubeiq.git
cd tubeiq

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your keys

# 4. Run the dev server
npm run dev
```

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite
- **Auth & DB:** Firebase (Google Auth + Firestore)
- **AI:** Google Gemini API
- **YouTube:** YouTube Data API v3
- **Hosting:** Netlify (static site)

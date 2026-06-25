# 🎵 Harmony — Mood-Based Bollywood Music Player

Play full Bollywood songs by mood or search. Powered by **Invidious API** (free, no key needed) + YouTube IFrame for playback.

## Features
- 8 moods: Happy, Sad, Romantic, Alone, Energetic, Angry, Peaceful, Nostalgic
- Search any song by name or artist
- Full song playback via YouTube IFrame
- Auto-skip unplayable videos
- Smart caching — reduces server calls
- Multi-server fallback — if one Invidious server is down, tries the next

## Setup

### Backend
```bash
cd backend
npm install
npm run dev        # development
npm start          # production
```
No `.env` changes needed — Invidious requires no API key.

### Frontend
```bash
cd frontend
npm install
npm start
```

### Health Check
Visit `http://localhost:5000/api/health` to see which Invidious servers are currently up.

## How it works
1. **Search** — Invidious API fetches YouTube video IDs (free, unlimited)
2. **Playback** — YouTube IFrame API plays the video (free, always)

## Troubleshooting
- If songs don't load, visit `/api/health` to check server status
- Invidious servers are community-hosted; occasionally one goes down — the app auto-retries others
- Results are cached for 10 minutes to speed up repeated mood clicks

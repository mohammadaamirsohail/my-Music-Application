import React, { useState, useCallback } from "react";
import Chatbot from "./components/Chatbot";
import Player from "./components/Player";
import SearchBar from "./components/SearchBar";
import "./App.css";

export const MOODS = [
  { key: "happy",     label: "Happy",     emoji: "☀️",  color: "#fbbf24" },
  { key: "sad",       label: "Sad",       emoji: "🌧️", color: "#60a5fa" },
  { key: "romantic",  label: "Romantic",  emoji: "🌹",  color: "#f472b6" },
  { key: "alone",     label: "Alone",     emoji: "🌙",  color: "#a78bfa" },
  { key: "energetic", label: "Energetic", emoji: "⚡",  color: "#34d399" },
  { key: "angry",     label: "Angry",     emoji: "🔥",  color: "#f87171" },
  { key: "peaceful",  label: "Peaceful",  emoji: "🍃",  color: "#6ee7b7" },
  { key: "nostalgic", label: "Nostalgic", emoji: "📻",  color: "#fdba74" },
];

export default function App() {
  const [songs, setSongs]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [activeMood, setActiveMood]   = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode]               = useState("mood");

  const fetchByMood = useCallback(async (mood) => {
    setLoading(true);
    setError(null);
    setSongs([]);
    setCurrentSong(null);
    setActiveMood(mood);
    setMode("mood");
    setSearchQuery("");

    try {
      const res  = await fetch("https://harmony-backend-l4i8.onrender.com/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch songs");
      setSongs(data.songs);
      if (data.songs.length > 0) setCurrentSong(data.songs[0]);
    } catch (err) {
      setError(err.message || "Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBySearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSongs([]);
    setCurrentSong(null);
    setActiveMood(null);
    setMode("search");
    setSearchQuery(query);

    try {
      const res  = await fetch("https://harmony-backend-l4i8.onrender.com/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSongs(data.songs);
      if (data.songs.length > 0) setCurrentSong(data.songs[0]);
    } catch (err) {
      setError(err.message || "Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleShuffle = () => {
    if (mode === "mood" && activeMood) fetchByMood(activeMood);
    else if (mode === "search" && searchQuery) fetchBySearch(searchQuery);
  };

  const moodData = MOODS.find((m) => m.key === activeMood) || null;

  return (
    <div className="app">
      <div className="blob blob-1" style={{ "--c": moodData?.color || "#e879f9" }} />
      <div className="blob blob-2" style={{ "--c": moodData?.color || "#06b6d4" }} />

      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-word">Harmony</span>
        </div>
        <p className="tagline">full songs · any mood · free forever</p>
      </header>

      <main className="app-main">
        <SearchBar onSearch={fetchBySearch} loading={loading} />

        <Chatbot
          moods={MOODS}
          activeMood={activeMood}
          loading={loading}
          onSelectMood={fetchByMood}
          searchMode={mode === "search"}
          searchQuery={searchQuery}
        />

        {error && (
          <div className="error-box">
            ⚠️ {error}
            <span className="error-hint"> — Try clicking again, the server is auto-retrying.</span>
          </div>
        )}

        {(songs.length > 0 || loading) && (
          <Player
            songs={songs}
            loading={loading}
            moodData={moodData}
            currentSong={currentSong}
            onSelectSong={setCurrentSong}
            onShuffle={handleShuffle}
            searchQuery={mode === "search" ? searchQuery : null}
          />
        )}
      </main>

      <footer className="app-footer">
        Powered by YouTube · Full songs · No limits
      </footer>
    </div>
  );
}

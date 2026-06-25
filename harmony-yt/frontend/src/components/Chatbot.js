import React, { useState } from "react";
import "./Chatbot.css";

export default function Chatbot({ moods, activeMood, loading, onSelectMood }) {
  const [typed, setTyped] = useState("");
  const activeMoodData = moods.find((m) => m.key === activeMood);

  const handleMoodClick = (key) => {
    onSelectMood(key);
    setTyped("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = typed.trim().toLowerCase();
    const match = moods.find((m) => m.key === val || m.label.toLowerCase() === val)
      || moods.find((m) => m.key.startsWith(val));
    if (match) handleMoodClick(match.key);
  };

  return (
    <div className="chatbot">
      <div className="chat-row">
        <div className="bot-avatar">♪</div>
        <div className="chat-bubble">
          {activeMood ? (
            <span>
              Playing <b style={{ color: activeMoodData?.color }}>{activeMoodData?.emoji} {activeMoodData?.label}</b> songs for you — full songs, no limits! 🎵
            </span>
          ) : (
            <span>Hey! What's your mood right now? Pick one below 👇</span>
          )}
        </div>
      </div>

      <div className="mood-grid">
        {moods.map((m) => (
          <button
            key={m.key}
            className={`mood-btn ${activeMood === m.key ? "active" : ""}`}
            style={{ "--mc": m.color }}
            onClick={() => handleMoodClick(m.key)}
            disabled={loading}
          >
            <span className="m-emoji">{m.emoji}</span>
            <span className="m-label">{m.label}</span>
            {activeMood === m.key && <span className="m-dot" />}
          </button>
        ))}
      </div>

      <form className="type-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Or type your mood…"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !typed.trim()}>
          {loading ? <span className="spin" /> : "Go"}
        </button>
      </form>
    </div>
  );
}

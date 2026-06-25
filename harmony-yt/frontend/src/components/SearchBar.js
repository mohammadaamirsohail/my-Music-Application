import React, { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="search-bar">
      <div className="search-label">🔍 Search any song directly</div>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type song name, artist, anything… e.g. Tum Hi Ho, Kesariya"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="search-input"
        />
        <button type="submit" disabled={loading || !query.trim()} className="search-btn">
          {loading ? <span className="spin" /> : "Search"}
        </button>
      </form>
      <div className="search-hints">
        Try: <span onClick={() => onSearch("Tum Hi Ho")}>Tum Hi Ho</span>
        <span onClick={() => onSearch("Kesariya")}>Kesariya</span>
        <span onClick={() => onSearch("Raatan Lambiyan")}>Raatan Lambiyan</span>
        <span onClick={() => onSearch("Kal Ho Na Ho")}>Kal Ho Na Ho</span>
        <span onClick={() => onSearch("Senorita")}>Senorita</span>
      </div>
    </div>
  );
}

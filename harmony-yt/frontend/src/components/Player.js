import React, { useState, useEffect, useRef } from "react";
import "./Player.css";

function useYouTubeAPI() {
  const [ready, setReady] = useState(!!window.YT?.Player);
  useEffect(() => {
    if (window.YT?.Player) { setReady(true); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setReady(true);
  }, []);
  return ready;
}

function SkeletonCard() {
  return (
    <div className="song-card skeleton">
      <div className="sk-thumb" />
      <div className="sk-info">
        <div className="sk-line sk-t" />
        <div className="sk-line sk-a" />
      </div>
    </div>
  );
}

export default function Player({ songs, loading, moodData, currentSong, onSelectSong, onShuffle, searchQuery }) {
  const playerRef    = useRef(null);
  const ytPlayer     = useRef(null);
  const songsRef     = useRef(songs);
  const currentRef   = useRef(currentSong);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [progress,  setProgress]    = useState(0);
  const [duration,  setDuration]    = useState(0);
  const [volume,    setVolume]      = useState(80);
  const [skipped,   setSkipped]     = useState(null);
  const intervalRef  = useRef(null);
  const skipTimerRef = useRef(null);
  const ytReady      = useYouTubeAPI();

  // Keep refs in sync
  useEffect(() => { songsRef.current  = songs;       }, [songs]);
  useEffect(() => { currentRef.current = currentSong; }, [currentSong]);

  const autoSkipToNext = () => {
    const list = songsRef.current;
    const curr = currentRef.current;
    if (!list.length || !curr) return;
    const idx  = list.findIndex((s) => s.id === curr.id);
    const next = list[(idx + 1) % list.length];
    setSkipped(curr.title);
    setTimeout(() => setSkipped(null), 3000);
    onSelectSong(next);
  };

  useEffect(() => {
    if (!ytReady || !currentSong) return;
    clearTimeout(skipTimerRef.current);
    setProgress(0);
    setDuration(0);

    if (ytPlayer.current) {
      ytPlayer.current.loadVideoById(currentSong.id);
      setIsPlaying(true);
    } else {
      ytPlayer.current = new window.YT.Player(playerRef.current, {
        height: "0", width: "0",
        videoId: currentSong.id,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;

            if (e.data === S.PLAYING) {
              setIsPlaying(true);
              clearTimeout(skipTimerRef.current);
              setDuration(ytPlayer.current.getDuration());
              clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                setProgress(ytPlayer.current.getCurrentTime());
              }, 500);
            }

            if (e.data === S.PAUSED) {
              setIsPlaying(false);
              clearInterval(intervalRef.current);
            }

            // Auto skip if video is unplayable or errors
            if (e.data === S.ENDED) {
              clearInterval(intervalRef.current);
              autoSkipToNext();
            }
          },
          onError: () => {
            // Video unplayable — auto skip after 1 second
            skipTimerRef.current = setTimeout(() => {
              autoSkipToNext();
            }, 1000);
          },
        },
      });
    }

    // Safety net — if nothing plays in 8 seconds, auto skip
    skipTimerRef.current = setTimeout(() => {
      try {
        const state = ytPlayer.current?.getPlayerState();
        // -1 = unstarted, 3 = buffering too long
        if (state === -1 || state === 3) {
          autoSkipToNext();
        }
      } catch (e) {}
    }, 8000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(skipTimerRef.current);
    };
  }, [currentSong, ytReady]); // eslint-disable-line

  useEffect(() => { ytPlayer.current?.setVolume(volume); }, [volume]);

  const togglePlay = () => {
    if (!ytPlayer.current || !currentSong) return;
    if (isPlaying) ytPlayer.current.pauseVideo();
    else           ytPlayer.current.playVideo();
  };

  const seek = (e) => {
    if (!ytPlayer.current || !duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    ytPlayer.current.seekTo(ratio * duration, true);
    setProgress(ratio * duration);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  const prevSong = () => {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    onSelectSong(songs[(idx - 1 + songs.length) % songs.length]);
  };

  const nextSong = () => {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    onSelectSong(songs[(idx + 1) % songs.length]);
  };

  return (
    <div className="player">
      <div ref={playerRef} style={{ display: "none" }} />

      {/* Auto skip notification */}
      {skipped && (
        <div className="skip-toast">
          ⏭ Skipped unplayable song — playing next
        </div>
      )}

      {/* Header */}
      <div className="player-head">
        <h2 className="pl-title">
          {moodData
            ? <><span style={{ color: moodData.color }}>{moodData.emoji}</span> {moodData.label} Playlist</>
            : `🔍 Results for "${searchQuery}"`}
        </h2>
        <div className="pl-right">
          <span className="pl-count">{loading ? "Loading…" : `${songs.length} songs`}</span>
          {!loading && songs.length > 0 && (
            <button className="shuffle-btn" onClick={onShuffle} title="Get fresh songs">
              🔀 Shuffle
            </button>
          )}
        </div>
      </div>

      {/* Now Playing */}
      {currentSong && (
        <div className="now-playing" style={{ "--mc": moodData?.color || "var(--accent)" }}>
          <img src={currentSong.thumbnail} alt={currentSong.title} className="np-thumb" />
          <div className="np-info">
            <p className="np-title">{currentSong.title}</p>
            <p className="np-channel">{currentSong.channel}</p>
            <div className="prog-wrap">
              <span className="time-label">{fmt(progress)}</span>
              <div className="prog-bar" onClick={seek}>
                <div className="prog-fill" style={{ width: `${pct}%` }} />
                <div className="prog-thumb" style={{ left: `${pct}%` }} />
              </div>
              <span className="time-label">{fmt(duration)}</span>
            </div>
          </div>
          <div className="np-right">
            <button className="big-play" onClick={togglePlay}
              style={{ "--mc": moodData?.color || "var(--accent)" }}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div className="skip-btns">
              <button onClick={prevSong}>⏮</button>
              <button onClick={nextSong}>⏭</button>
            </div>
            <div className="vol-wrap">
              <span>🔊</span>
              <input type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="vol-slider" />
            </div>
          </div>
        </div>
      )}

      {/* Song List */}
      <div className="song-list">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : songs.map((song, i) => {
              const active = currentSong?.id === song.id;
              return (
                <button key={song.id}
                  className={`song-card ${active ? "active" : ""}`}
                  style={{ "--mc": moodData?.color || "var(--accent)", animationDelay: `${i * 0.04}s` }}
                  onClick={() => onSelectSong(song)}>
                  <span className="s-num">{active && isPlaying ? "♪" : i + 1}</span>
                  <img src={song.thumbnail} alt={song.title} className="s-thumb" />
                  <div className="s-info">
                    <p className="s-title">{song.title}</p>
                    <p className="s-channel">{song.channel}</p>
                  </div>
                  <a href={song.youtubeUrl} target="_blank" rel="noreferrer"
                    className="yt-link" onClick={(e) => e.stopPropagation()}
                    title="Open in YouTube">▶ YT</a>
                </button>
              );
            })}
      </div>
    </div>
  );
}

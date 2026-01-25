import { useAudioPlayer } from "expo-audio";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Episode, Podcast } from "../types/podcast";

type PlayerContextType = {
  podcast: Podcast | null;
  episode: Episode | null;
  sourceUri: string | null;
  play: (podcast: Podcast, episode: Episode, uri: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  release: () => void;
  seekTo: (seconds: number) => void;
  skipForward: (seconds: number) => void;
  skipBackward: (seconds: number) => void;
  playing: boolean;
  positionSeconds: number;
  durationSeconds: number;
};

export const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const playerRef = useRef<ReturnType<typeof useAudioPlayer> | null>(null);

  const player = useAudioPlayer(uri ?? "", {
    updateInterval: 500,
    downloadFirst: false,
  });

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    setIsPlaying(Boolean(player.playing));
  }, [player.playing]);

  // 🔴 LIVE PLAYBACK POLLING (fixes frozen progress bar)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        const pos = Number(playerRef.current.currentTime ?? 0);
        const dur = Number(playerRef.current.duration ?? 0);

        setPositionSeconds(pos);
        setDurationSeconds(dur);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const stopPlayer = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.seekTo(0);
      }
      setPositionSeconds(0);
    } catch (error) {
      console.error("Error stopping player:", error);
    }
  };

  const releasePlayer = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.seekTo(0);
        playerRef.current.remove();
      }
      setPodcast(null);
      setEpisode(null);
      setUri(null);
      setIsPlaying(false);
      setPositionSeconds(0);
      setDurationSeconds(0);
      console.log("🗑️ Player released from memory");
    } catch (error) {
      console.error("Error releasing player:", error);
    }
  };

  const playTrack = (p: Podcast, e: Episode, u: string) => {
    console.log("🎵 Playing:", e.title, "from", u);

    stopPlayer();

    setPodcast(p);
    setEpisode(e);
    setUri(u);
    setPositionSeconds(0);
    setDurationSeconds(0);

    setTimeout(() => {
      try {
        if (playerRef.current) {
          playerRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    }, 150);
  };

  const pausePlayer = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        setPositionSeconds(Number(playerRef.current.currentTime ?? 0));
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing:", error);
    }
  };

  const resumePlayer = () => {
    try {
      if (playerRef.current) {
        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error resuming:", error);
    }
  };

  const seekToPosition = (seconds: number) => {
    try {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds);
        setPositionSeconds(seconds);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const skipForward = (seconds: number) => {
    try {
      if (playerRef.current) {
        const currentPos = Number(playerRef.current.currentTime ?? 0);
        const duration = Number(playerRef.current.duration ?? 0);
        const newPos = Math.min(currentPos + seconds, duration);
        playerRef.current.seekTo(newPos);
        setPositionSeconds(newPos);
      }
    } catch (error) {
      console.error("Error skipping forward:", error);
    }
  };

  const skipBackward = (seconds: number) => {
    try {
      if (playerRef.current) {
        const currentPos = Number(playerRef.current.currentTime ?? 0);
        const newPos = Math.max(currentPos - seconds, 0);
        playerRef.current.seekTo(newPos);
        setPositionSeconds(newPos);
      }
    } catch (error) {
      console.error("Error skipping backward:", error);
    }
  };

  const value: PlayerContextType = {
    podcast,
    episode,
    sourceUri: uri,
    play: playTrack,
    pause: pausePlayer,
    resume: resumePlayer,
    stop: stopPlayer,
    release: releasePlayer,
    seekTo: seekToPosition,
    skipForward,
    skipBackward,
    playing: isPlaying,
    positionSeconds,
    durationSeconds,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("PlayerProvider missing");
  return ctx;
}

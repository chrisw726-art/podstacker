import { useAudioPlayer } from "expo-audio";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Episode, Podcast } from "../types/podcast";
import { getEpisodeProgress, saveEpisodeProgress } from "./progressStore";

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

  // Session counter: every time we start a new play request, we bump this.
  // Any old intervals/timeouts become "stale" and won't touch native objects.
  const sessionRef = useRef(0);

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

  const persistProgress = async () => {
    try {
      if (!playerRef.current || !podcast || !episode) return;

      const pos = Number(playerRef.current.currentTime ?? 0);
      const dur = Number(playerRef.current.duration ?? 0);

      if (dur > 0) {
        await saveEpisodeProgress({
          podcastId: podcast.id,
          episodeId: episode.id,
          positionSeconds: pos,
          durationSeconds: dur,
          updatedAt: Date.now(),
        });
      }
    } catch {
      // Native player may have been released mid-call during rapid switching
    }
  };

  // 🔴 LIVE PLAYBACK POLLING (safe against rapid switching)
  useEffect(() => {
    if (!isPlaying) return;

    const mySession = sessionRef.current;

    const interval = setInterval(() => {
      try {
        if (!playerRef.current) return;
        if (sessionRef.current !== mySession) return;

        const pos = Number(playerRef.current.currentTime ?? 0);
        const dur = Number(playerRef.current.duration ?? 0);

        setPositionSeconds(pos);
        setDurationSeconds(dur);
      } catch {
        // Released player between ticks: ignore
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // 🧠 AUTO-SAVE PROGRESS WHILE PLAYING (safe against rapid switching)
  useEffect(() => {
    if (!isPlaying || !podcast || !episode) return;

    const mySession = sessionRef.current;

    const interval = setInterval(() => {
      if (sessionRef.current !== mySession) return;
      persistProgress();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, podcast, episode]);

  // Stop playback WITHOUT wiping progress.
  const stopPlayer = async () => {
    try {
      await persistProgress();
      if (playerRef.current) {
        playerRef.current.pause();
      }
    } catch (error) {
      console.error("Error stopping player:", error);
    }
  };

  const releasePlayer = async () => {
    try {
      await persistProgress();

      if (playerRef.current) {
        try {
          playerRef.current.pause();
        } catch {}
        try {
          playerRef.current.remove();
        } catch {}
      }

      setPodcast(null);
      setEpisode(null);
      setUri(null);
      setIsPlaying(false);
      setPositionSeconds(0);
      setDurationSeconds(0);
    } catch (error) {
      console.error("Error releasing player:", error);
    }
  };

  const playTrack = async (p: Podcast, e: Episode, u: string) => {
    // Invalidate all previous timers/async play attempts
    sessionRef.current += 1;
    const mySession = sessionRef.current;

    // Stop current playback (saves progress, does NOT wipe it)
    await stopPlayer();

    // Swap to new track
    setPodcast(p);
    setEpisode(e);
    setUri(u);
    setPositionSeconds(0);
    setDurationSeconds(0);

    setTimeout(async () => {
      try {
        // If user tapped to another episode, this play attempt is stale
        if (sessionRef.current !== mySession) return;
        if (!playerRef.current) return;

        // Restore saved progress (if any)
        const saved = await getEpisodeProgress(p.id, e.id);
        if (saved && saved.positionSeconds > 5) {
          try {
            playerRef.current.seekTo(saved.positionSeconds);
            setPositionSeconds(saved.positionSeconds);
          } catch {
            // ignore if native player changes mid-seek
          }
        }

        // Play
        if (sessionRef.current !== mySession) return;
        try {
          playerRef.current.play();
          setIsPlaying(true);
        } catch {
          // ignore
        }
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    }, 150);
  };

  const pausePlayer = async () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        setPositionSeconds(Number(playerRef.current.currentTime ?? 0));
        setIsPlaying(false);
      }
      await persistProgress();
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
    pause: () => {
      // keep API type simple
      pausePlayer();
    },
    resume: resumePlayer,
    stop: () => {
      // keep API type simple
      stopPlayer();
    },
    release: () => {
      releasePlayer();
    },
    seekTo: seekToPosition,
    skipForward,
    skipBackward,
    playing: isPlaying,
    positionSeconds,
    durationSeconds,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("PlayerProvider missing");
  return ctx;
}

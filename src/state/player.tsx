import { useAudioPlayer } from "expo-audio";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Episode, Podcast } from "../types/podcast";

type PlayerContextType = {
  podcast: Podcast | null;
  episode: Episode | null;
  sourceUri: string | null;

  play: (podcast: Podcast, episode: Episode, uri: string) => void;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;

  playing: boolean;
  positionSeconds: number;
  durationSeconds: number;
};

export const PlayerContext = createContext<PlayerContextType | null>(null);


export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [uri, setUri] = useState<string | null>(null);

  const player = useAudioPlayer(uri ?? "", {
    updateInterval: 500,
    downloadFirst: false
  });

  const value = useMemo<PlayerContextType>(
    () => ({
      podcast,
      episode,
      sourceUri: uri,

      play: (p, e, u) => {
        setPodcast(p);
        setEpisode(e);
        setUri(u);
        setTimeout(() => {
          player.play();
        }, 50);
      },

      pause: () => player.pause(),
      resume: () => player.play(),
      seekTo: (s) => player.seekTo(s),

      playing: Boolean(player.playing),
      positionSeconds: Number(player.currentTime ?? 0),
      durationSeconds: Number(player.duration ?? 0)
    }),
    [podcast, episode, uri, player]
  );

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

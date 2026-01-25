import React, { createContext, useContext, useState } from "react";
import { Pin, Episode, Podcast } from "../types/podcast";
import { addPin as savePinToStore } from "./pinsStore";

type PinCaptureState = 
  | { status: "idle" }
  | { status: "marking"; startSeconds: number; episode: Episode; podcast: Podcast };

type PinContextType = {
  captureState: PinCaptureState;
  startCapture: (positionSeconds: number, episode: Episode, podcast: Podcast) => void;
  endCapture: (endSeconds: number) => void;
  cancelCapture: () => void;
  pendingPin: PendingPin | null;
  savePendingPin: (note?: string) => Promise<void>;
  dismissPending: () => void;
};

type PendingPin = {
  episode: Episode;
  podcast: Podcast;
  startSeconds: number;
  endSeconds: number;
};

export const PinContext = createContext<PinContextType | null>(null);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [captureState, setCaptureState] = useState<PinCaptureState>({ status: "idle" });
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);

  const startCapture = (positionSeconds: number, episode: Episode, podcast: Podcast) => {
    console.log("📌 START PIN at", positionSeconds);
    setCaptureState({
      status: "marking",
      startSeconds: positionSeconds,
      episode,
      podcast,
    });
  };

  const endCapture = (endSeconds: number) => {
    if (captureState.status !== "marking") return;

    console.log("📌 END PIN at", endSeconds);
    
    setPendingPin({
      episode: captureState.episode,
      podcast: captureState.podcast,
      startSeconds: captureState.startSeconds,
      endSeconds,
    });

    setCaptureState({ status: "idle" });
  };

  const cancelCapture = () => {
    console.log("📌 CANCEL PIN");
    setCaptureState({ status: "idle" });
  };

  const savePendingPin = async (note?: string) => {
    if (!pendingPin) return;

    const pin: Pin = {
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      episodeId: pendingPin.episode.id,
      podcastId: pendingPin.podcast.id,
      createdAt: Date.now(),
      positionSeconds: pendingPin.startSeconds,
      endSeconds: pendingPin.endSeconds,
      note: note || "",
    };

    await savePinToStore(pendingPin.podcast.id, pin);

    console.log("📌 PIN SAVED:", pin);
    
    setPendingPin(null);
  };

  const dismissPending = () => {
    setPendingPin(null);
  };

  return (
    <PinContext.Provider
      value={{
        captureState,
        startCapture,
        endCapture,
        cancelCapture,
        pendingPin,
        savePendingPin,
        dismissPending,
      }}
    >
      {children}
    </PinContext.Provider>
  );
}

export function usePins() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error("PinProvider missing");
  return ctx;
}

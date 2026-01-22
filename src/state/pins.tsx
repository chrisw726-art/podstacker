import React, { createContext, useContext, useState } from "react";
import { Pin } from "../types/podcast";
import { addPin as savePinToLibrary } from "./library";

/* 
 * Pin Capture System
 * Constitution: "Pinning is a core listening action, not a feature layer"
 * 
 * Flow:
 * 1. First tap -> start marking (records position)
 * 2. Second tap -> end marking (records end position)
 * 3. Save modal appears with auto-generated title
 * 4. User can edit title, add note, assign to stack
 */

type PinCaptureState = 
  | { status: "idle" }
  | { status: "marking"; startSeconds: number; episodeId: string; podcastId: string };

type PinContextType = {
  captureState: PinCaptureState;
  startCapture: (episodeId: string, podcastId: string, positionSeconds: number) => void;
  endCapture: (endSeconds: number) => void;
  cancelCapture: () => void;
  pendingPin: PendingPin | null;
  savePendingPin: (title?: string, note?: string, stackId?: string) => Promise<void>;
  dismissPending: () => void;
};

type PendingPin = {
  episodeId: string;
  podcastId: string;
  startSeconds: number;
  endSeconds: number;
  autoTitle: string;
};

export const PinContext = createContext<PinContextType | null>(null);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [captureState, setCaptureState] = useState<PinCaptureState>({ status: "idle" });
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);

  const startCapture = (episodeId: string, podcastId: string, positionSeconds: number) => {
    console.log("📌 START PIN at", positionSeconds);
    setCaptureState({
      status: "marking",
      startSeconds: positionSeconds,
      episodeId,
      podcastId,
    });
  };

  const endCapture = (endSeconds: number) => {
    if (captureState.status !== "marking") return;

    console.log("📌 END PIN at", endSeconds);
    
    const duration = endSeconds - captureState.startSeconds;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const autoTitle = `Pin • ${formatTime(captureState.startSeconds)} - ${formatTime(endSeconds)} (${minutes}m ${seconds}s)`;

    setPendingPin({
      episodeId: captureState.episodeId,
      podcastId: captureState.podcastId,
      startSeconds: captureState.startSeconds,
      endSeconds,
      autoTitle,
    });

    setCaptureState({ status: "idle" });
  };

  const cancelCapture = () => {
    console.log("📌 CANCEL PIN");
    setCaptureState({ status: "idle" });
  };

  const savePendingPin = async (title?: string, note?: string, stackId?: string) => {
    if (!pendingPin) return;

    const pin: Pin = {
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      episodeId: pendingPin.episodeId,
      podcastId: pendingPin.podcastId,
      createdAt: Date.now(),
      positionSeconds: pendingPin.startSeconds,
      note: title || pendingPin.autoTitle,
    };

    await savePinToLibrary(pendingPin.podcastId, pin);
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

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

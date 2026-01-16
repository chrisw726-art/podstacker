# PodStacker MVP Definition

This file defines the locked MVP scope and development order.

---

## MVP Includes

- Android + iOS support
- Manual podcast search
- Library system
- Episode downloads
- Offline playback
- Background/Bluetooth playback
- Per‑podcast auto‑download toggle
- Global download settings (Wi‑Fi priority)
- Timestamp pinning with optional notes
- Landscape playback mode
- Dark theme with future theme switching
- Local‑first storage

---

## Explicitly Out of MVP

- Discovery feeds
- Recommendations
- Leaderboards
- Social features
- Audio clipping/export
- Analytics systems
- Paid tiers

---

## Locked Design Rules

- Search is intentional only
- No silent fallback between directories
- No merging or deduplication across sources
- Library is the home of the app
- Pins reference audio, never extract it
- Features must not turn PodStacker into a content‑creation platform

---

## Current Progress

- App shell complete
- Navigation stabilized
- Theme system live
- Library functional
- Search functional
- Refresh button placed
- Download system scaffolded
- Player scaffolded
- Pin model scaffolded

---

## Build Order

1. Wire Library refresh to real feed sync  
2. Add new‑episode indicators  
3. Add delete from library  
4. Add per‑podcast auto‑download toggle  
5. Connect refresh → auto‑downloads  
6. Add artwork thumbnails  
7. Polish downloads screen  
8. Finalize Now Playing + Pins flow  

---

## Guiding Principle

Clarity over cleverness.  
Intentional over addictive.  
Ownership over platforms.


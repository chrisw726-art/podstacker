# PodStacker

PodStacker is a privacy‑first, intentional podcast player focused on manual search, library‑centered listening, offline playback, and timestamp pinning.

Built with Expo (React Native) for Android + iOS.

---

## Core Philosophy
- Tool, not a feed
- Intentional over algorithmic
- Offline‑first
- User‑owned data
- No ads, no tracking, no discovery pressure

---

## Current Features

- Podcast search (Apple Podcasts primary, PodcastIndex fallback)
- Add/remove podcasts from Library
- Persistent local storage
- Downloads system scaffolded
- Background/Bluetooth playback scaffolded
- Timestamp pinning scaffolded
- Global dark theme system
- Branded application shell
- Manual refresh control in Library

---

## App Structure

### App Shell / Navigation
src/components/AppShell.tsx  
Controls header, branding, tab navigation, and app background.

### Tabs
app/(tabs)/library.tsx  
app/(tabs)/search.tsx  
app/(tabs)/downloads.tsx  
app/(tabs)/nowplaying.tsx  
app/(tabs)/pins.tsx  

### Theme
src/theme/ThemeProvider.tsx

### State
src/state/library.ts  
src/state/settings.ts  
src/state/downloads.ts  
src/state/player.ts  

### Search Directories
src/lib/directories/apple.ts  
src/lib/directories/podcastIndex.ts  

---

## Status

The app is fully themed, navigation stabilized, library and search functional, and MVP foundations are in place.

Next milestone: connect refresh → episode sync → new episode indicators → auto‑download.


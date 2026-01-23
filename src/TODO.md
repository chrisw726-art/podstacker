# PODSTACKER DESIGN IMPLEMENTATION TODO

Last Updated: January 23, 2026

---

## PHASE 1: FIX CRITICAL PLAYER BUGS (MUST DO FIRST)

### 1.1 Fix Progress Bar Updates
- [ ] Add useEffect in player.tsx that polls positionSeconds every 500ms when playing
- [ ] Update UI to show live progress during playback
- **File:** `src/state/player.tsx`

### 1.2 Create Pins Viewer Screen
- [ ] Create new file: `app/(tabs)/pins.tsx`
- [ ] Show all saved pins grouped by episode/podcast  
- [ ] Tappable to jump to that moment in playback
- **File:** `app/(tabs)/pins.tsx` (NEW)

### 1.3 Add Pin Markers on Progress Bar
- [ ] Get pins for current episode from pins context
- [ ] Render small markers on timeline at pin timestamps
- [ ] Visual indicator showing where pins exist
- [ ] **File:** `app/(tabs)/nowplaying/index.tsx`

---

## PHASE 2: PORTRAIT MODE CONSTITUTION

### 2.1 Library as True Home  
- [x] App opens to library (already correct)
- [ ] Verify no "home screen" or feed concept exists
- [ ] Ensure refresh is intentional, not automatic

### 2.2 Podcast "Activation" Behavior
- [ ] When podcast tapped, animate expansion (not screen switch)
- [ ] Background flows from podcast tile
- [ ] Shelf reveals inside expanding tile
- [ ] System "reorganizes around it" - library fades back slightly
- **Files:** `app/(tabs)/library.tsx`, `app/(tabs)/podcast/[podcastId].tsx`

### 2.3 Episode "Quiet Start" Behavior  
- [ ] Episode tap starts playback immediately
- [ ] No modal screens, no takeovers
- [ ] Mini-player acknowledges calmly
- [ ] Workspace (library/shelf) remains visible

### 2.4 Back as "Depth Decompression"
- [ ] Back from podcast shelf = decompress to library
- [ ] Animate contraction, not screen pop
- [ ] Feel like "stepping back through layers"

---

## PHASE 3: MOTION & CONTINUITY

### 3.1 Podcast Tile → Shelf Transform
- [ ] Podcast tile expands in place
- [ ] Background color flows from tile
- [ ] Episode list reveals as depth increases
- [ ] Feels like "opening an object" not "going to page"

### 3.2 Mini-Player Interaction Refinement
- [x] Already permanent  
- [ ] Verify it can slide up/down for comfort
- [ ] Sliding doesn't change screens
- [ ] Pin button always accessible
- **File:** `src/components/MiniPlayer.tsx`

### 3.3 Pinning Flow Polish
- [ ] First tap starts pin (visual feedback)
- [ ] Second tap ends pin + shows save sheet
- [ ] Default title auto-generated
- [ ] Quick save, no friction

---

## PHASE 4: LANDSCAPE MODE CONSOLE

### 4.1 Rotation Transform
- [ ] Portrait → Landscape = surfaces reveal
- [ ] Panels unfold, don't snap
- [ ] Depth increases, context expands
- [ ] Never resets what's playing

### 4.2 Console Layout Structure  
- [ ] Now Playing module anchored at top
- [ ] Main board shows Downloads by default
- [ ] Mode tabs across top: Library | Search | Downloads | Pins
- [ ] Tabs switch surfaces, console frame stays

### 4.3 Stacks as Side Trays
- [ ] Opening stack slides tray from side
- [ ] Dashboard remains visible
- [ ] Pins displayed as visual cards (not rows)
- [ ] Tray docks beside console

---

## PHASE 5: VISUAL IDENTITY

### 5.1 Style Theme: Dashboard Instrument
- [ ] Feels like control surface, not content feed
- [ ] Dense but calm
- [ ] Tactile, responsive, studio-like
- [ ] User feels "capable, not entertained"
- **Files:** Theme system in `src/theme/`

### 5.2 Episode as Object
- [ ] Episodes show visible properties: title, duration, file size, download state
- [ ] Feel like objects with weight, not rows
- [ ] Two states: "Referenced" (link) vs "Possessed" (downloaded)

### 5.3 Remove Anti-Patterns
- [ ] No feed-like discovery
- [ ] No social features  
- [ ] No gamification
- [ ] No noisy notifications
- [ ] Calm, archival, intentional

---

## PHASE 6: FINAL POLISH

### 6.1 Downloads Screen Polish
- [ ] Uncomment swipe-to-delete
- [x] Add artwork thumbnails (already done)
- [ ] Ensure feels like "local machine state"
- **File:** `app/(tabs)/downloads.tsx`

### 6.2 Library Refresh UX
- [ ] Refresh is intentional action (pull/button)
- [ ] Shows new episode indicators clearly
- [ ] Auto-downloads for enabled podcasts work
- [ ] Feels like "syncing personal archive"

### 6.3 Pins & Stacks Final Flow
- [ ] Pins viewer feels like "collected artifacts"
- [ ] Stacks feel like "personal knowledge containers"
- [ ] Not disposable queues - meaningful collections
- [ ] Easy to return to marked moments

---

## IMPLEMENTATION ORDER (Priority)

1. ✅ Create this TODO list
2. Fix progress bar (5 min)
3. Create pins viewer (30 min)
4. Add pin markers on timeline (15 min)
5. Podcast expansion animation (1 hour)
6. Episode quiet-start (30 min)
7. Landscape console layout (2 hours)
8. Motion polish (1-2 hours)
9. Visual theme refinement (ongoing)

---

**Last Commit:** Initial TODO creation
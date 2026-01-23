# PodStacker UI & Motion Constitution
**Vision + Interface Specification**

Version 1.0

---

## 0. Purpose of this document

This file defines the visual philosophy, interaction model, and interface rules of PodStacker.

It exists to:
- Preserve the original vision
- Prevent feature/UI drift
- Make future design and coding decisions obvious
- Allow new styles without breaking identity
- Serve as a long-term design constitution

This is not a mood board. This is not a theme list.

**This is the source of truth for how PodStacker should feel and behave.**

---

## 1. Core Identity (Locked)

PodStacker is:
- A personal listening machine
- A feature-rich playing studio
- A private orchestration console

It is NOT:
- a feed
- a social network
- a discovery casino
- a content firehose

PodStacker is built around:
- ownership
- depth
- continuity
- intentional listening
- offline readiness
- personal collections

The app should feel like:
**"My listening instrument. My stack of knowledge. My studio."**

---

## 2. Master Visual Direction

### Portrait mode = Dashboard / Instrument
Portrait is the **control surface**.

It should feel like:
- a dashboard
- a listening cockpit
- an instrument panel
- a machine made for playback

Characteristics:
- dense but calm
- layered
- powerful
- responsive
- tactile
- studio-like

**The user should feel capable, not entertained.**

### Landscape mode = Console / Studio machine
Landscape turns PodStacker into a **full studio device**.

It should feel like:
- a physical console
- a desk machine
- an orchestrated system
- something you operate

This is where:
- controls expand
- space opens
- motion slows
- immersion increases

**Portrait = carry. Landscape = operate.**

---

## 3. Motion Philosophy (Very Important)

PodStacker uses **continuity-based UI**.

Not:
- tap → screen disappears → new screen appears

But:
- object transforms → becomes its next state

This includes:
- podcast tiles expanding into views
- artwork growing into headers
- players emerging from rows
- pins materializing from playback
- stacks forming from moments

**UI should behave like a single surface.**

- Back = compression
- Forward = expansion
- Depth = meaning

The user should feel like they are **going deeper, not going somewhere else.**

---

## 4. Dashboard Rules (Portrait)

### 4.1 Mini Player
- **Always present**
- Always visible in portrait
- Never fully disappears
- Can slide up or down (user preference)
- Does not expand into a different screen
- Pin button always lives here

**The mini player is the heartbeat of the app. It is the physical anchor.**

### 4.2 Default content
By default, the dashboard shows:
- What's playing
- What's next
- Downloads

**Primary listening mode is prepared listening, not browsing.**

### 4.3 Top mode tabs
Top tabs allow fast switching between:
- Downloads (default)
- Library
- Search
- Pins
- Wave (future listening/visual mode)

These are **views on the same surface**, not different worlds.

---

## 5. Player Behavior (Locked)

- Playback starts immediately
- No ceremonial screens
- No blocking transitions
- Progress is always visible

**The user always feels in control.**

---

## 6. Pin System (Core mechanic)

**Pins are not bookmarks. Pins are captured moments.**

### Interaction model:
- First tap → start pin
- Second tap → end pin
- Save sheet appears
- Default title auto-generated
- User can rename
- Stack it (saves the clip data)

Pins store:
- start time
- end time
- episode
- podcast
- date
- optional note
- optional future metadata

Pins live in **Stacks**.

**Stacks are not playlists. Stacks are personal knowledge artifacts.**

---

## 7. Stacks Philosophy

Stacks represent:
- collections of meaning
- research threads
- ideas in progress
- listening journeys

They are **owned structures**, not consumption lists.

They should feel:
- personal
- crafted
- archival
- meaningful

Not disposable queues.

---

## 8. Style / Theme System

PodStacker supports **STYLE THEMES** in addition to color themes.

Style themes change:
- surface treatment
- materials
- lighting
- panel design
- control aesthetics
- mood

They do NOT change:
- navigation structure
- features
- philosophy
- motion language
- app behavior

**Think of them as skins over the same machine.**

---

## 9. What styles are allowed to change:
- textures
- lighting
- shadows/glow
- corner language
- depth
- control presentation
- panel shapes
- background treatments

## 10. What styles are NOT allowed to change:
- navigation logic
- mini player behavior
- pin flow
- stack concept
- offline-first design
- object-continuity motion
- library-first philosophy
- privacy-first foundation

**If a style breaks these, it is not a PodStacker style.**

---

## 11. Long-term UI goal

PodStacker should feel like:
- a device you grow into
- a system you build over time
- a personal listening environment
- something people keep for years

**Not something people "try."**

---

## 12. Development rule

Before any UI change, ask:

**Does this increase:**
- control?
- clarity?
- continuity?
- ownership?
- depth?

**If not, it does not belong.**

---

End of constitution.

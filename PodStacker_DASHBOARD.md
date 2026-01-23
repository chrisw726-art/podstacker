# PodStacker Dashboard Constitution
**Portrait Mode**

This document defines how PodStacker behaves, feels, and structures itself in portrait orientation.

It is not a layout spec. It is not a feature list. It is the operating philosophy of the PodStacker dashboard.

All future UI, animation, and interaction decisions must conform to this.

---

## Core identity

In portrait mode, PodStacker is:

**A personal remote control for a listening machine.**

It is not:
- a content browser
- a feed
- a typical media app

It is **a control surface** for:
- what is playing now
- and what is being captured from it

The emotional center of the app is:
- the currently playing episode
- the act of pinning / collecting moments

Everything else supports this.

---

## Default state

When PodStacker opens:
- The app opens to the **Library Dashboard**
- The library is home
- There is no separate home screen
- New episodes appear only by intentional refresh

The dashboard should always feel:
- powered on
- personal
- owned

Never empty.

---

## The mini-player: primary surface

The mini-player is a **permanent console surface**.

### Rules:
- **Always visible** in portrait mode
- Always shows the last played episode when idle
- Contains the pin control
- Acts as a status strip, not a stage

The mini-player is not a screen. It is **part of the machine**.

### Positioning behavior:
- The mini-player can be slid up and down
- Sliding is for comfort and preference only
- Sliding does not open screens or change modes
- It behaves like a **docked control rail**

---

## Visual gravity

When the app opens and nothing is playing:
- The eye goes to the library

When something is playing:
- The mini-player is present
- But the library remains the workspace

The console supports the library. The library does not serve the console.

---

## Interaction philosophy

PodStacker does not navigate. It **reconfigures**.

- Surfaces move
- Objects shift
- Depth changes

The user is never "taken somewhere else." They go **deeper into the same system**.

---

## Podcast behavior

When a podcast is tapped:
- The system reorganizes around it
- The podcast becomes the active source
- The rest of the library fades back
- Nothing teleports
- Nothing hard-switches

This is not "opening a page." It is **activating a source**.

---

## Episode behavior

When an episode is tapped:
- It simply starts playing
- No takeover screen
- No mode switch
- No visual drama

Playback becomes active, but the workspace remains. The console acknowledges change calmly.

---

## Pinning

Pinning is not a feature layer. It is a **core listening action**.

- Pin control lives on the mini-player
- It is always reachable
- It is part of the playback surface

Listening and capturing are inseparable.

---

## Back behavior

Back does not exit screens. Back always feels like **stepping back through depth**:

- Things decompress
- return to prior states
- re-establish the broader workspace

Never "go to page." Always "return to layer."

---

## Motion language

Portrait mode motion should feel:
- continuous
- physical
- restrained
- system-driven
- non-theatrical

More like:
- panels settling
- surfaces adjusting
- focus shifting

Less like:
- cards flipping
- pages swiping
- apps switching

---

## Summary of portrait rules

1. Library is home
2. Mini-player is permanent
3. Mini-player is light, not dominant
4. Playback does not replace workspace
5. Podcasts activate the system
6. Episodes start quietly
7. Pinning is central
8. Back = depth, not exit

---

## Relationship to landscape mode

Landscape mode is not a new app. It is:

**The dashboard unfolded into a studio machine.**

- Portrait = compressed console
- Landscape = deployed console

Same object. Different density.

---

This document is the soul of PodStacker's UI. If something violates it, the app drifts.

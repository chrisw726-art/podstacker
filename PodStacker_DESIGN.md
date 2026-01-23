# PodStacker Design Charter

## What PodStacker is

PodStacker is a **personal audio archive tool**, not a traditional podcast app.

It is designed to help users:
- intentionally collect podcasts
- store episodes locally
- mark meaningful moments
- build personal stacks of references
- and return to them over time

PodStacker is **not**:
- a discovery feed
- a social network
- a creator platform
- a clip app
- or an algorithmic product

It is a **powerful, personal listening instrument**.

---

## Core product tone

PodStacker should always feel:
- **Powerful** — capable, tool-like, intentional
- **Personal** — owned, private, meaningful
- **Archival** — long-term, structured, memory-oriented
- **Calm** — not noisy, not gamified, not addictive
- **Physical** — objects, shelves, states, transformation

---

## Core mental models

PodStacker is built on a small set of consistent metaphors:
- **Podcasts are shelves**
- **Episodes are objects**
- **Downloads are possession**
- **Pins are marked passages**
- **Stacks are trays of references**
- **Playback is something you do to an object**

The app should never feel like "screens." It should feel like working with a collection.

---

## The shelf system

When a user taps a podcast, they are not "opening a page." They are **opening a shelf**.

The first tap into a podcast is a **transform moment**:
- the podcast tile expands
- the background flows from it
- the shelf is revealed inside it

Navigation should emphasize **continuity of object**, not screen switching.

The podcast shelf is a **chronological archive**:
- newest episodes at the top
- older episodes receding downward
- the shelf feels like a living log

The library itself remains structured and fast. The shelf is where immersion begins.

---

## Episode object model

An episode is not a row. It is an **object with visible properties**.

Every episode may display:
- **title** (identity)
- **duration** (length)
- **file size** (weight)
- **download state** (Referenced vs Possessed)

Episodes exist in two fundamental states:

### Referenced
The episode is known, but not owned.
- It exists in the feed
- It can be played remotely
- It is not guaranteed to stay available

### Possessed
The episode has been downloaded.
- It exists locally
- It is permanently accessible
- It is owned

This distinction is a core identity principle.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

MetroMosaic — React + Vite web app wrapped as a native iOS app with Capacitor. Save places, group them into lists, send one link. See README.md for the design-doc screen mapping and known gaps.

## Commands

```
npm run dev     # browser dev server
npm test        # node test.js — the whole suite (data roundtrip self-check)
npm run lint    # oxlint
npm run sync    # build + cap sync ios
npm run ios     # build + sync + open Xcode
npm run device  # sync + ios/install.sh — build, sign, install, launch on paired iPhone
```

No test framework: `test.js` is a plain node script of `assert` calls. Add checks there rather than introducing a runner.

Brand images are generated, not hand-drawn: `swift tools/appicon.swift icon <path>` writes the 1024px app icon and `... splash <path>` the 2732px launch image (same nine-flag mosaic). Rerun and overwrite the files in `Assets.xcassets` to change them.

`npm run device` signs with team `ZZT9HHZQNA` by default; override with `TEAM=XXXXXXXXXX npm run device`.

## Architecture

Five source files, ~700 lines total. Keep it that way — no router, no state library, no component-per-file split.

- `src/App.jsx` — the whole app shell. State is one `useState(load)` object persisted to localStorage by an effect. Navigation is a **screen stack array**, not a router: `go(screen)` pushes, `back()` pops, a `switch` on `stack[stack.length-1].name` renders. Modals are a single `sheet` state (`{kind:'send'|'location'}`).
- `src/data.js` — the store: seed content, `load()`/`save()` over `localStorage` key `metromosaic.v1`, `TAGS`/`KINDS` constants, `shareUrl()`. `load()` spreads saved data over the seed, so new seed fields appear for existing users but saved `places`/`lists` win.
- `src/screens.jsx` — all eight screens. `src/ui.jsx` — shared `Icon` map (inline SVG), `Kind`, `Photo`, `TopBar`, `Hero`. Styling is inline objects plus CSS vars from `src/index.css`; no CSS framework.

**Receiver view**: `#l=<payload>` in the URL short-circuits before the screen stack and renders `PublicList` from the same build — it must work in a plain browser with no app installed. There is no backend: `packList`/`unpackList` in `data.js` deflate the list into the fragment (short keys, photos dropped — ~1.3KB for nine places), so a sent link needs nothing but the static site. `SITE` in `data.js` is the host those links point at; change it after deploying. Fragments never reach a server, so the list isn't logged anywhere.

## Native layer

`ios/App/App/NearbyPlugin.swift` is an app-local Capacitor plugin (MapKit `MKLocalPointsOfInterestRequest`, no API key) turning a coordinate into nearby place names. App-local plugins are **not** auto-discovered: `ViewController.swift` registers it in `capacitorDidLoad()`, and `SceneDelegate` must use that controller. JS side registers it with a web fallback in `src/screens.jsx` (`registerPlugin('Nearby', { web: ... })`) — in the browser there's no equivalent, so dev falls back to showing raw coordinates.

Location permission: `App.jsx#askLocation` shows an in-app explainer sheet first; the OS prompt comes from `Geolocation.getCurrentPosition` itself. There's no separate permission gate to keep in sync.

Any web change needs `npm run sync` before it reaches the device — `dist/` is what Capacitor copies.

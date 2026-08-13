# MetroMosaic

Keep the places you'd recommend, send one link instead of retyping them.
React + Vite web app wrapped as a native iOS app with Capacitor.

Imported from the Claude Design project (turn 3 — "recommendations you can send as a link").

```
npm run dev     # browser
npm test        # node test.js — data roundtrip self-check
npm run device  # build, sign, install and launch on a paired iPhone
npm run ios     # build + sync + open Xcode
npm run sync    # build + sync only
```

Signing: `ios/install.sh` defaults to team `ZZT9HHZQNA` (the one that already had a
usable development cert on this Mac — it signs as "Apple Development: Gal Etrog").
Use your own with `TEAM=XXXXXXXXXX npm run device`. Bundle id `com.metromosaic.app`.

Screens, mapped to the design doc: `MyPlaces` 3a · `SavePlace` 3b · `ListScreen` 3c ·
`SendSheet` 3d · `PublicList` 3e · `PlaceScreen` 3f · `AnswerAsk` 3g · offline banner
and location ask 3h. All in `src/screens.jsx`; `src/ui.jsx` holds the shared row, hero
and icons; `src/data.js` is the seeded store (localStorage).

Native bits: `@capacitor/share` for sending a list, `@capacitor/geolocation` plus a
local `Nearby` plugin (`ios/App/App/NearbyPlugin.swift`, MapKit — no API key) that
turns a coordinate into nearby place names and addresses. App-local plugins are not
auto-discovered: `ViewController.swift` registers it and `SceneDelegate` uses that
controller. In a browser there's no equivalent, so `npm run dev` falls back to
showing coordinates. The receiver's view (`?l=<slug>`) is the same build — it's
meant to open in a browser with no app installed.

Not done yet: no backend, so links aren't really resolvable and "keep it live" is
local-only; photos aren't stored; addresses from Locate are raw coordinates until a
reverse-geocode provider is wired up.

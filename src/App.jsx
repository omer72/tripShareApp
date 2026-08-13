import { useEffect, useState } from 'react'
import { Geolocation } from '@capacitor/geolocation'
import { load, otherNotes, placeKey, save, setMembership, unpackList } from './data'
import { Capacitor } from '@capacitor/core'
import { AnswerAsk, Cities, Countries, ListScreen, Lists, LocationSheet, MyPlaces, Nearby, OfflineBanner, PlaceScreen, PublicList, SavePlace, SendSheet, Splash, Welcome } from './screens'

const SEEN = 'metromosaic.welcomed'

// Copy-paste and messengers add line breaks, percent-encoding and stray spaces.
const readLink = () => {
  if (!location.hash.startsWith('#l=')) return ''
  const raw = location.hash.slice(3)
  try {
    return decodeURIComponent(raw).replace(/\s+/g, '')
  } catch {
    return raw.replace(/\s+/g, '')
  }
}

// Screen stack instead of a router: one back button, no dep.
export default function App() {
  const [state, setState] = useState(load)
  // Held for three seconds on a cold start; a shared link skips it, since the
  // person opening one came for the list, not for us.
  const [booting, setBooting] = useState(!location.hash.startsWith('#l='))
  const [welcomed, setWelcomed] = useState(() => !!localStorage.getItem(SEEN))
  const [stack, setStack] = useState([{ name: 'home' }])
  const [sheet, setSheet] = useState(null) // {kind:'send', list} | {kind:'location', resolve}
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => save(state), [state])
  useEffect(() => {
    if (!booting) return
    const done = setTimeout(() => setBooting(false), 3000)
    return () => clearTimeout(done)
  }, [booting])
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync) }
  }, [])

  const top = stack[stack.length - 1]
  const go = (s) => setStack((st) => [...st, s])
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st))
  const placesOf = (list) => list.placeIds.map((id) => state.places.find((p) => p.id === id)).filter(Boolean)

  // Explain in-app once, before the OS prompt — so a "no" isn't permanent. The OS
  // prompt itself comes from getCurrentPosition; no permission gate to get wrong.
  const askLocation = async () => {
    if ((await Geolocation.checkPermissions().catch(() => null))?.location === 'granted') return true
    return new Promise((resolve) => {
      setSheet({
        kind: 'location',
        allow: () => { setSheet(null); resolve(true) },
        decline: () => { setSheet(null); resolve(false) },
      })
    })
  }

  // Same form for both, so one handler: with an id it edits in place, without it creates.
  const savePlace = ({ id, name, address, phone, instagram, note, kind, tags, stars, listIds, photos, city, country }) => {
    if (id) {
      setState((s) => ({
        ...s,
        places: s.places.map((p) => (p.id === id ? { ...p, name, address, phone, instagram, note, kind, tags, stars, photos, city, country } : p)),
        lists: setMembership(s.lists, id, listIds),
      }))
      back()
      return
    }
    const place = {
      id: `p${Date.now()}`,
      name,
      address,
      phone,
      instagram,
      note,
      kind,
      tags,
      stars,
      city,
      country,
      area: '',
      sent: 0,
      photos,
      queued: !online,
    }
    setState((s) => ({
      ...s,
      places: [place, ...s.places],
      lists: s.lists.map((l) => (listIds.includes(l.id) ? { ...l, placeIds: [...l.placeIds, place.id] } : l)),
    }))
    // Land on the city you just filed it under, so you see it land.
    setStack((st) => {
      const rest = st.slice(0, -1)
      const under = rest[rest.length - 1]
      return under?.name === 'places' && under.city === city ? rest : [...rest, { name: 'places', city, country }]
    })
  }

  // Keeping a shared list copies its places into yours, skipping any already kept.
  const keepShared = (shared) => {
    setState((s) => {
      // Matched by name + city, not id — keeping a place two people sent you
      // shouldn't leave you with it twice. The other notes stay readable on it.
      const mine = new Set(s.places.map(placeKey))
      const added = shared.places.filter((p) => !mine.has(placeKey(p))).map((p) => ({ ...p, sent: 0, from: shared.by }))
      return { ...s, places: [...added, ...s.places] }
    })
    back()
  }

  // One city's pins — yours and anything shared with you there, deduped. Places
  // with no coordinates get geocoded natively; we keep what comes back so the
  // second open is instant.
  const [mapping, setMapping] = useState(false)
  const showMap = async (city) => {
    const all = [
      ...state.places.map((p) => ({ ...p, mine: true })),
      ...(state.shared ?? []).flatMap((s) => s.places.map((p) => ({ ...p, mine: false }))),
    ].filter((p) => p.city === city)
    const seen = new Set()
    const pins = []
    for (const p of all) {
      const key = placeKey(p)
      if (seen.has(key)) continue
      seen.add(key)
      pins.push({ key, name: p.name, note: p.note, address: p.address, city: p.city, mine: p.mine, latitude: p.lat, longitude: p.lng })
    }
    setMapping(true)
    try {
      const { located } = await Nearby.showMap({ places: pins })
      if (located?.length) {
        setState((s) => ({
          ...s,
          places: s.places.map((p) => {
            const hit = located.find((l) => l.key === placeKey(p))
            return hit ? { ...p, lat: hit.latitude, lng: hit.longitude } : p
          }),
        }))
      }
    } finally {
      setMapping(false)
    }
  }

  // Sharing a city sends what you're looking at — that city, that filter — not
  // whichever saved list happens to come first.
  const cityList = (city, places, filter) => ({
    id: `city-${city}`,
    title: filter && filter !== 'All' ? `${city}, ${filter[0] + filter.slice(1).toLowerCase()}` : city,
    blurb: `The ${places.length} places I'd send you in ${city}.`,
    placeIds: places.map((p) => p.id),
    sent: 0,
    live: false,
  })

  // Your name rides along on every link you send, so it's worth being yours.
  const rename = () => {
    const name = prompt('Your name, as people see it on lists you send', state.me.name)?.trim()
    if (name) setState((s) => ({ ...s, me: { ...s.me, name } }))
  }

  // Deleting someone else's list only drops it from your inbox — anything you
  // already kept from it stays in your places.
  const removeShared = (list) => {
    if (!confirm(`Delete “${list.title}” from ${list.by}? Places you already kept stay.`)) return false
    setState((s) => ({ ...s, shared: s.shared.filter((x) => x.id !== list.id) }))
    return true
  }

  const countSend = (listId) =>
    setState((s) => ({ ...s, lists: s.lists.map((l) => (l.id === listId ? { ...l, sent: l.sent + 1 } : l)) }))

  // A sent link opens the receiver's view — same build, no app and no account.
  // The list travels in the fragment, so decoding it is all there is to do.
  // Copy-paste and messengers add line breaks, percent-encoding and stray spaces;
  // none of that changes the payload, so forgive it rather than call it damaged.
  const [packed, setPacked] = useState(readLink)
  const [incoming, setIncoming] = useState(packed ? undefined : null)
  useEffect(() => {
    // A second link opened in the same tab only changes the hash — no reload.
    const sync = () => setPacked(readLink())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  useEffect(() => {
    if (!packed) { setIncoming(null); return }
    setIncoming(undefined)
    unpackList(packed).then(setIncoming).catch(() => setIncoming(null))
  }, [packed])

  if (packed) {
    if (incoming === undefined) return <div className="screen" style={{ padding: 'calc(var(--top) + 40px) 24px', font: '400 16px Archivo, sans-serif', color: 'var(--ink-3)' }}>Opening the list…</div>
    if (incoming === null) return (
      <div className="screen" style={{ padding: 'calc(var(--top) + 40px) 24px', font: '400 16px/1.5 Archivo, sans-serif', color: 'var(--ink-2)' }}>
        That link is damaged — usually it got cut short on the way here. Ask whoever sent it to send it again, and open it without editing the address.
        <div className="meta" style={{ marginTop: 14 }}>{packed.length} CHARACTERS RECEIVED</div>
      </div>
    )
    return (
      <PublicList
        list={incoming.list}
        places={incoming.places}
        openInApp={Capacitor.isNativePlatform() ? undefined : `metromosaic://open#l=${packed}`}
        onKeep={() => {
          // Keeping writes them into this device's own places, then drops the link.
          setState((s) => {
            const mine = new Set(s.places.map(placeKey))
            const added = incoming.places
              .filter((p) => !mine.has(placeKey(p)))
              .map((p, i) => ({ ...p, id: `p${Date.now()}${i}`, sent: 0, from: incoming.list.by }))
            return { ...s, places: [...added, ...s.places] }
          })
          location.hash = ''
          location.reload()
        }}
      />
    )
  }

  const screen = () => {
    switch (top.name) {
      case 'save': {
        const editing = top.id && state.places.find((p) => p.id === top.id)
        return <SavePlace key={top.id ?? 'new'} state={state} back={back} place={editing || undefined} onSave={(f) => savePlace({ ...f, id: top.id })} askLocation={askLocation} city={top.city} country={top.country} />
      }
      case 'cities':
        return <Cities state={state} country={top.country} back={back} go={go} />
      case 'places':
        return <MyPlaces state={state} go={go} back={back} city={top.city} country={top.country} onMap={() => showMap(top.city)} mapping={mapping} onShareAll={(places, filter) => setSheet({ kind: 'send', list: cityList(top.city, places, filter) })} />
      case 'shared': {
        const s = state.shared.find((x) => x.id === top.id)
        return (
          <PublicList
            list={s}
            places={s.places}
            onBack={back}
            onKeep={() => keepShared(s)}
            onDelete={() => { if (removeShared(s)) back() }}
            others={(p) => otherNotes(p, state.shared)}
          />
        )
      }
      case 'lists':
        return <Lists state={state} back={back} go={go} onRename={rename} />
      case 'ask':
        return <AnswerAsk state={state} back={back} onSend={(list) => setSheet({ kind: 'send', list })} />
      case 'list': {
        const list = state.lists.find((l) => l.id === top.id)
        return <ListScreen list={list} places={placesOf(list)} back={back} go={go} onSend={() => setSheet({ kind: 'send', list })} />
      }
      case 'place': {
        const place = state.places.find((p) => p.id === top.id)
        const asList = { id: place.id, title: place.name, blurb: place.note, placeIds: [place.id], sent: place.sent, live: false, slug: place.id }
        return <PlaceScreen place={place} back={back} others={otherNotes(place, state.shared)} onEdit={() => go({ name: 'save', id: place.id })} onSend={() => setSheet({ kind: 'send', list: asList })} />
      }
      default:
        return <Countries state={state} go={go} onRemoveShared={removeShared} />
    }
  }

  if (booting) return <Splash />

  if (!welcomed) {
    return <Welcome me={state.me} onStart={() => { localStorage.setItem(SEEN, '1'); setWelcomed(true) }} />
  }

  const queued = state.places.filter((p) => p.queued).length

  return (
    <>
      {screen()}
      {!online && <OfflineBanner queued={queued} />}
      {sheet?.kind === 'send' && (
        <SendSheet list={sheet.list} places={placesOf(sheet.list)} me={state.me} close={() => setSheet(null)} onSent={() => countSend(sheet.list.id)} />
      )}
      {sheet?.kind === 'location' && <LocationSheet onAllow={sheet.allow} onDecline={sheet.decline} />}
    </>
  )
}

import { useEffect, useState } from 'react'
import { registerPlugin } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { Geolocation } from '@capacitor/geolocation'
import { KINDS, TAGS, byCountry, flagOf, initialsOf, instagramHandle, shareUrl, shrink } from './data'
import { Hero, Icon, Kind, Photo, PlaceRow, Stars, TopBar } from './ui'

const mapsUrl = (p) => `https://maps.apple.com/?q=${encodeURIComponent(`${p.name} ${p.address || ''}`)}`

// Native (MapKit) lookup of what's around a coordinate. In a browser there's no
// equivalent without an API key, so the web build just falls back to coordinates.
// showMap has no browser equivalent either — dev falls back to a Google Maps
// search for the first pin, which is as close as a plain browser gets.
export const Nearby = registerPlugin('Nearby', {
  web: () => ({
    lookup: async () => ({ suggestions: [] }),
    scanCode: async () => { throw new Error('Scanning needs the app — type the handle instead.') },
    showMap: async ({ places }) => {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent([places[0]?.name, places[0]?.city].filter(Boolean).join(' '))}`, '_blank')
      return { located: [] }
    },
  }),
})

/* The launch image is a flash — iOS drops it the moment the webview is up. This
   is the same artwork in the app, so the two look like one screen that holds. */
export const SPLASH_FLAGS = ['🇵🇹', '🇪🇸', '🇮🇹', '🇬🇷', '🇮🇱', '🇫🇷', '🇺🇸', '🇲🇽', '🇹🇭']

export function Splash() {
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {SPLASH_FLAGS.map((f, i) => (
          <span key={i} style={{ fontSize: 54, lineHeight: 1.15, textAlign: 'center' }}>{f}</span>
        ))}
      </div>
      <div style={{ font: '700 34px Archivo, sans-serif', letterSpacing: '-.03em', marginTop: 30 }}>MetroMosaic</div>
    </div>
  )
}

/* 0 — Welcome: shown once, before anything else */
export function Welcome({ me, onStart }) {
  return (
    <div className="screen">
      <div className="scroll" style={{ padding: 'calc(var(--top) + 64px) 26px 0' }}>
        <div className="eyebrow" style={{ letterSpacing: '.18em' }}>METROMOSAIC</div>
        <div style={{ font: '700 38px/1.08 Archivo, sans-serif', letterSpacing: '-.035em', marginTop: 14 }}>
          The places you'd actually send someone.
        </div>
        <div style={{ font: '400 17px/1.6 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 16 }}>
          Keep them by country and city, with the one line that says why. When a friend asks, send a link — no app needed on their end.
        </div>
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Save a place in one line', 'The note is the only required field.'],
            ['Countries, then cities', 'Everything you kept, where you kept it.'],
            ['Shared with you', 'Lists friends sent, kept separate until you want them.'],
          ].map(([t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>{Icon.check()}</div>
              <div>
                <div style={{ font: '600 17px Archivo, sans-serif' }}>{t}</div>
                <div style={{ font: '400 15px/1.45 Archivo, sans-serif', color: 'var(--ink-3)', marginTop: 3 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 26px calc(var(--bottom) + 16px)' }}>
        <button className="btn btn-orange" onClick={onStart}>Start, {me.name.split(' ')[0]} {Icon.right()}</button>
      </div>
    </div>
  )
}

/* 1 — Home: your countries, and what people sent you */
export function Countries({ state, go, onRemoveShared }) {
  const tree = byCountry(state.places)
  const countries = Object.keys(tree).sort()

  return (
    <div className="screen">
      <div style={{ padding: 'calc(var(--top) + 16px) 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ letterSpacing: '.15em' }}>MY PLACES · {state.places.length}</div>
          <div style={{ font: '700 29px/1.15 Archivo, sans-serif', letterSpacing: '-.028em', marginTop: 8 }}>Where you've been</div>
        </div>
        <button onClick={() => go({ name: 'lists' })} className="avatar" style={{ width: 34, height: 34, fontSize: 14 }}>
          {initialsOf(state.me.name)}
        </button>
      </div>

      <div className="scroll" style={{ padding: '18px 20px 24px' }}>
        {countries.map((c) => {
          const cities = Object.keys(tree[c])
          const total = cities.reduce((n, city) => n + tree[c][city], 0)
          return (
            <button key={c} className="card" onClick={() => go({ name: 'cities', country: c })} style={{ width: '100%', padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 19px Archivo, sans-serif', letterSpacing: '-.015em' }}>{[flagOf(c), c].filter(Boolean).join(' ')}</div>
                <div className="meta" style={{ marginTop: 6 }}>{cities.length} {cities.length === 1 ? 'CITY' : 'CITIES'} · {total} PLACES</div>
                <div style={{ font: '400 14.5px Archivo, sans-serif', color: 'var(--ink-3)', marginTop: 5 }}>{cities.join(' · ')}</div>
              </div>
              {Icon.right('#8A8F92')}
            </button>
          )
        })}
        {!countries.length && <p style={{ color: 'var(--ink-3)', fontSize: 15 }}>Nothing kept yet. Save a place and it lands here.</p>}

        {!!state.shared?.length && (
          <>
            <div className="eyebrow" style={{ marginTop: 26 }}>SHARED WITH YOU · {state.shared.length}</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.shared.map((s) => (
                <div key={s.id} className="card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => go({ name: 'shared', id: s.id })} style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
                    <Photo src={s.places[0]?.photos?.[0]} size={52} radius={9} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 16.5px Archivo, sans-serif' }}>{s.title}</div>
                      <div className="meta" style={{ marginTop: 5 }}>{s.by.toUpperCase()} · {s.places.length} PLACES</div>
                    </div>
                    {Icon.right('#8A8F92')}
                  </button>
                  {/* Someone else's list you're done with — yours to drop. */}
                  <button onClick={() => onRemoveShared(s)} aria-label={`Delete ${s.title}`} style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', background: 'var(--fill)' }}>
                    {Icon.trash()}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '0 20px calc(var(--bottom) + 10px)' }}>
        <button className="btn btn-orange" onClick={() => go({ name: 'save' })}>{Icon.plus()} Save a place</button>
      </div>
    </div>
  )
}

/* 2 — Cities in a country */
export function Cities({ state, country, back, go }) {
  const cities = Object.entries(byCountry(state.places)[country] ?? {}).sort()

  return (
    <div className="screen">
      <TopBar onBack={back} title={[flagOf(country), country].filter(Boolean).join(' ')} />
      <div className="scroll" style={{ padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cities.map(([city, n]) => (
          <button key={city} className="card" onClick={() => go({ name: 'places', city, country })} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '700 19px Archivo, sans-serif', letterSpacing: '-.015em' }}>{city}</div>
              <div className="meta" style={{ marginTop: 6 }}>{n} {n === 1 ? 'PLACE' : 'PLACES'}</div>
            </div>
            {Icon.right('#8A8F92')}
          </button>
        ))}
      </div>
    </div>
  )
}

/* 3a — My places: the keeper. One city at a time. */
export function MyPlaces({ state, go, back, onShareAll, onMap, mapping, city = state.places[0]?.city ?? '', country }) {
  const [filter, setFilter] = useState('All')
  const inCity = state.places.filter((p) => p.city === city)
  const shown = filter === 'All' ? inCity : inCity.filter((p) => p.kind === filter)
  const count = (k) => inCity.filter((p) => p.kind === k).length

  return (
    <div className="screen">
      <div style={{ padding: 'calc(var(--top) + 16px) 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {back && <button onClick={back} aria-label="Back" style={{ display: 'flex', marginTop: 14 }}>{Icon.back()}</button>}
          <div>
            <div className="eyebrow" style={{ letterSpacing: '.15em' }}>{flagOf(country)} {(country || 'MY PLACES').toUpperCase()} · {inCity.length}</div>
            <div style={{ font: '700 29px/1.15 Archivo, sans-serif', letterSpacing: '-.028em', marginTop: 8 }}>{city}</div>
          </div>
        </div>
        <button onClick={() => go({ name: 'lists' })} className="avatar" style={{ width: 34, height: 34, fontSize: 14 }}>
          {initialsOf(state.me.name)}
        </button>
      </div>

      <div className="row-strip" style={{ padding: '16px 20px 0', flex: 'none' }}>
        <button className={`chip ${filter === 'All' ? 'on' : ''}`} onClick={() => setFilter('All')}>All {inCity.length}</button>
        {Object.keys(KINDS).map((k) => (
          <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
            {k[0] + k.slice(1).toLowerCase()} {count(k)}
          </button>
        ))}
      </div>

      <div className="scroll" style={{ padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map((p) => (
          <PlaceRow
            key={p.id}
            place={p}
            boxed
            size={82}
            onClick={() => go({ name: 'place', id: p.id })}
            footer={<div className="meta" style={{ marginTop: 8 }}>{[p.area?.toUpperCase(), p.sent ? `SENT ${p.sent}×` : null].filter(Boolean).join(' · ')}</div>}
          />
        ))}
        {!shown.length && <p style={{ color: 'var(--ink-3)', fontSize: 15 }}>Nothing kept here yet.</p>}
      </div>

      <div style={{ padding: '0 20px calc(var(--bottom) + 10px)', display: 'flex', gap: 9 }}>
        <button className="btn btn-ink" onClick={() => onShareAll(shown, filter)}>{Icon.share('#F3F1EB')} Share these {shown.length}</button>
        <button className="btn btn-plain" onClick={onMap} disabled={mapping} aria-label={`${city} on a map`} style={{ width: 50, flex: 'none' }}>{Icon.pin(mapping ? '#8A8F92' : '#E2552B')}</button>
        <button className="btn btn-orange" onClick={() => go({ name: 'save', city, country })} aria-label="Save a place" style={{ width: 50, flex: 'none' }}>{Icon.plus()}</button>
      </div>
    </div>
  )
}

/* 3b — Save a place: one required field, the note. Doubles as the edit form when
   given a `place` — same fields, so there's no second screen to keep in step. */
export function SavePlace({ state, back, onSave, askLocation, place, city: atCity, country: atCountry }) {
  const [name, setName] = useState(place?.name ?? '')
  const [address, setAddress] = useState(place?.address ?? '')
  const [note, setNote] = useState(place?.note ?? '')
  const [phone, setPhone] = useState(place?.phone ?? '')
  const [instagram, setInstagram] = useState(place?.instagram ?? '')
  // Where it files. Prefilled when you came from a city, asked for when you didn't.
  const [city, setCity] = useState(place?.city ?? atCity ?? '')
  const [country, setCountry] = useState(place?.country ?? atCountry ?? '')
  const [kind, setKind] = useState(place?.kind ?? 'EAT')
  const [tags, setTags] = useState(place?.tags ?? [])
  const [stars, setStars] = useState(place?.stars ?? 0)
  const [listIds, setListIds] = useState(place ? state.lists.filter((l) => l.placeIds.includes(place.id)).map((l) => l.id) : [])
  const [locating, setLocating] = useState(false)
  const [problem, setProblem] = useState('')
  const [nearby, setNearby] = useState([])
  const [picked, setPicked] = useState(null)
  const [photos, setPhotos] = useState(place?.photos ?? [])
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const addPhotos = async (e) => {
    const files = [...e.target.files]
    e.target.value = '' // so picking the same file twice still fires onChange
    try {
      const added = await Promise.all(files.map((f) => shrink(f)))
      setPhotos((ps) => [...ps, ...added])
    } catch (err) {
      setProblem(err.message)
    }
  }

  // Picked by identity, not by address — two suggestions in one building share an address.
  // MapKit knows the city and country, so filing it is no extra typing.
  const pick = (s) => {
    setPicked(s)
    setName(s.name || name)
    setAddress(s.address)
    if (s.city) setCity(s.city)
    if (s.country) setCountry(s.country)
  }

  // The nametag code holds a profile URL; we keep the handle, not the URL.
  const scan = async () => {
    setProblem('')
    try {
      const { value } = await Nearby.scanCode()
      const handle = instagramHandle(value)
      if (handle) setInstagram(handle)
      else setProblem(`That code isn't an Instagram profile${value ? ` — it says ${value}` : ''}.`)
    } catch (e) {
      setProblem(e?.message || "Couldn't read that code. Type the handle instead.")
    }
  }

  const locate = async () => {
    setProblem('')
    if (!(await askLocation())) return
    setLocating(true)
    try {
      const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
      const { suggestions } = await Nearby.lookup({ latitude: coords.latitude, longitude: coords.longitude })
      if (suggestions?.length) {
        setNearby(suggestions)
      } else {
        setAddress(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`)
        setProblem("Couldn't name anything here — the coordinates will do.")
      }
    } catch (e) {
      // Location fails for ordinary reasons (denied, indoors, airplane mode). Say which.
      setProblem(e?.message || 'Location unavailable. Type it in instead.')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="screen">
      <div style={{ padding: 'calc(var(--top) + 14px) 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={back} style={{ font: '500 17px Archivo, sans-serif', color: 'var(--ink-2)' }}>Cancel</button>
        <div style={{ font: '600 15px Archivo, sans-serif' }}>{place ? 'Edit place' : 'Save a place'}</div>
        <div style={{ width: 44 }} />
      </div>

      <div className="scroll" style={{ padding: '20px 20px 20px' }}>
        <div className="card" style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>
          {Icon.pin()}
          <div style={{ flex: 1, minWidth: 0 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name" style={{ border: 0, outline: 'none', background: 'none', font: '600 17px Archivo, sans-serif', width: '100%' }} />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" style={{ border: 0, outline: 'none', background: 'none', font: '400 13.5px Archivo, sans-serif', color: 'var(--ink-3)', width: '100%', marginTop: 2 }} />
          </div>
          <button onClick={locate} disabled={locating} style={{ font: '500 14px Archivo, sans-serif', color: locating ? 'var(--ink-3)' : 'var(--green)' }}>
            {locating ? 'Locating…' : 'Locate'}
          </button>
        </div>

        {problem && <div style={{ marginTop: 8, font: '400 13.5px/1.45 Archivo, sans-serif', color: 'var(--orange)' }}>{problem}</div>}

        {nearby.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginTop: 16 }}>NEARBY — PICK ONE</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nearby.map((s, i) => {
                const on = picked === s
                return (
                  <button
                    key={i}
                    onClick={() => pick(s)}
                    style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: on ? 'rgba(27,94,75,.08)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 16px Archivo, sans-serif' }}>{s.name || s.address}</div>
                      {s.name && <div style={{ font: '400 13.5px Archivo, sans-serif', color: 'var(--ink-3)', marginTop: 2 }}>{s.address}</div>}
                    </div>
                    {on && Icon.check('var(--green)')}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <div className="eyebrow" style={{ marginTop: 20 }}>CITY</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 9 }}>
          <input className="field" style={{ flex: 1 }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lisbon" list="cities" />
          <input className="field" style={{ flex: 1 }} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Portugal" list="countries" />
        </div>
        {/* The cities you already keep, one tap instead of typing. */}
        <datalist id="cities">{[...new Set(state.places.map((p) => p.city).filter(Boolean))].map((c) => <option key={c} value={c} />)}</datalist>
        <datalist id="countries">{[...new Set(state.places.map((p) => p.country).filter(Boolean))].map((c) => <option key={c} value={c} />)}</datalist>

        <div className="eyebrow" style={{ marginTop: 20 }}>INSTAGRAM</div>
        <div className="card" style={{ marginTop: 10, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ font: '600 17px Archivo, sans-serif', color: 'var(--ink-3)' }}>@</span>
          <input value={instagram} onChange={(e) => setInstagram(instagramHandle(e.target.value) || e.target.value.replace(/[^A-Za-z0-9._]/g, ''))} placeholder="casaboa" autoCapitalize="none" autoCorrect="off" style={{ border: 0, outline: 'none', background: 'none', font: '400 16px Archivo, sans-serif', flex: 1, minWidth: 0 }} />
          <button onClick={scan} style={{ font: '500 14px Archivo, sans-serif', color: 'var(--green)' }}>Scan code</button>
        </div>

        <div className="eyebrow" style={{ marginTop: 20 }}>PHONE</div>
        <input className="field" type="tel" style={{ marginTop: 10 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 21 886 1234" />
        {/* The country code is the whole point — WhatsApp can't route without it. */}
        <div style={{ font: '400 13.5px Archivo, sans-serif', color: 'var(--ink-3)', marginTop: 7 }}>
          With the country code, so Call and WhatsApp work from anywhere.
        </div>

        <div className="eyebrow" style={{ marginTop: 20 }}>RATING</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Stars n={stars} size={26} onPick={setStars} />
          <span style={{ font: '400 14px Archivo, sans-serif', color: 'var(--ink-3)' }}>{stars ? `${stars}/5` : 'Optional'}</span>
        </div>

        <div className="eyebrow" style={{ marginTop: 20 }}>WHY YOU'D SEND IT</div>
        <textarea className="field" rows={3} style={{ marginTop: 10 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Go at six, before the queue." />

        <div style={{ marginTop: 9, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {TAGS.map((t) => (
            <button key={t} className={`pill ${tags.includes(t) ? 'on' : ''}`} onClick={() => setTags(toggle(tags, t))}>{t}</button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginTop: 22 }}>KIND</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 7 }}>
          {Object.keys(KINDS).map((k) => (
            <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{k[0] + k.slice(1).toLowerCase()}</button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginTop: 22 }}>PHOTOS</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <label style={{ width: 96, height: 96, borderRadius: 11, border: '1.5px dashed rgba(16,19,20,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {Icon.plus('#8A8F92')}
            <span style={{ font: '500 12.5px Archivo, sans-serif', color: 'var(--ink-3)' }}>Camera roll</span>
            {/* Native photo picker via the file input — iOS shows the roll for accept=image/* */}
            <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
          </label>
          {photos.map((src, i) => (
            <button key={i} onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label="Remove photo" style={{ position: 'relative' }}>
              <Photo src={src} size={96} radius={11} />
              <span style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,19,20,.6)', color: 'var(--paper)', font: '600 13px Archivo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</span>
            </button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginTop: 22 }}>ADD TO A LIST</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {state.lists.map((l) => (
            <button key={l.id} className={`chip ${listIds.includes(l.id) ? 'on' : ''}`} onClick={() => setListIds(toggle(listIds, l.id))}>{l.title}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px calc(var(--bottom) + 14px)' }}>
        {/* Say what's missing — a greyed-out button with no reason reads as broken. */}
        {(!name.trim() || !note.trim() || !city.trim()) && (
          <div style={{ font: '400 13.5px Archivo, sans-serif', color: 'var(--ink-3)', textAlign: 'center', marginBottom: 9 }}>
            {!name.trim() ? 'Needs a name' : !note.trim() ? 'Needs your note — that’s the part people read' : 'Needs a city — that’s where it files'}
          </div>
        )}
        <button
          className="btn btn-orange"
          disabled={!name.trim() || !note.trim() || !city.trim()}
          style={{ opacity: name.trim() && note.trim() && city.trim() ? 1 : 0.4 }}
          onClick={() => onSave({ name: name.trim(), address, phone: phone.trim(), instagram: instagram.trim(), note: note.trim(), kind, tags, stars, listIds, photos, city: city.trim(), country: country.trim() })}
        >
          {place ? 'Save changes' : 'Save place'}
        </button>
      </div>
    </div>
  )
}

/* 3c — A list: the thing you actually send */
export function ListScreen({ list, places, back, go, onSend }) {
  return (
    <div className="screen">
      <div className="scroll">
        <Hero height={212} src={places[0]?.photos?.[0]} onBack={back} eyebrow={`A LIST BY ${list.by ?? 'TAMAR R.'}`} title={list.title} />
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ font: '400 15.5px/1.55 Archivo, sans-serif', color: 'var(--ink-2)' }}>{list.blurb}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <span className="meta">{places.length} PLACES</span>
            <span className="meta">SENT {list.sent}×</span>
            <span className="meta">UPDATED {list.updated?.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ padding: '16px 20px 12px' }}>
          {places.map((p, i) => (
            <div key={p.id} style={{ borderBottom: i < places.length - 1 ? '1px solid var(--line)' : 0 }}>
              <PlaceRow place={p} onClick={() => go({ name: 'place', id: p.id })} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px calc(var(--bottom) + 14px)', background: 'rgba(243,241,235,.94)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--line)', display: 'flex', gap: 9 }}>
        <button className="btn btn-orange" onClick={onSend}>{Icon.share()} Send this list</button>
        <button className="btn btn-plain" aria-label="Edit list" style={{ width: 50, flex: 'none' }}>{Icon.pencil('#101314')}</button>
      </div>
    </div>
  )
}

/* 3d — Send: one link, any app */
export function SendSheet({ list, places, close, onSent, me }) {
  const [live, setLive] = useState(list.live)
  const [scope, setScope] = useState('link')
  // The link carries the list, so building it means compressing it first.
  const [url, setUrl] = useState('')
  useEffect(() => { shareUrl(list, places, me?.name).then(setUrl) }, [list, places, me])

  const send = async () => {
    if (!url) return
    try {
      await Share.share({ title: list.title, text: `${list.title} — ${places.length} places I'd send you`, url })
      onSent()
    } catch { /* user dismissed the native sheet */ }
    close()
  }

  return (
    <div className="sheet" onClick={close}>
      <div className="sheet-body" onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div style={{ font: '700 23px/1.2 Archivo, sans-serif', letterSpacing: '-.025em' }}>Send “{list.title}”</div>

        <div className="card" style={{ marginTop: 14, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <Photo src={places[0]?.photos?.[0]} size={44} radius={8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 15.5px Archivo, sans-serif' }}>{places.length} places · {me?.name ?? 'you'}</div>
            <div className="meta" style={{ marginTop: 5, letterSpacing: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {url ? `${url.replace('https://', '').slice(0, 44)}…` : 'Packing the list into the link…'}
            </div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginTop: 16 }}>WHO CAN OPEN IT</div>
        <div className="seg" style={{ marginTop: 10 }}>
          <button className={scope === 'link' ? 'on' : ''} onClick={() => setScope('link')}>Anyone with the link</button>
          <button className={scope === 'picked' ? 'on' : ''} onClick={() => setScope('picked')}>Only people I pick</button>
        </div>

        <button onClick={() => setLive(!live)} className="card" style={{ marginTop: 10, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>
            <div style={{ font: '600 15.5px Archivo, sans-serif' }}>Keep it live</div>
            <div style={{ font: '400 13.5px/1.4 Archivo, sans-serif', color: 'var(--ink-3)', marginTop: 3 }}>They see edits you make later</div>
          </div>
          <div style={{ width: 44, height: 26, borderRadius: 99, background: live ? 'var(--orange)' : 'rgba(16,19,20,.16)', padding: 3, display: 'flex', justifyContent: live ? 'flex-end' : 'flex-start', flex: 'none', transition: 'all .15s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
          </div>
        </button>

        <div style={{ marginTop: 18, display: 'flex', gap: 9 }}>
          <button className="btn btn-orange" onClick={send} disabled={!url} style={{ opacity: url ? 1 : 0.5 }}>{Icon.share()} Send link</button>
          <button className="btn btn-plain" disabled={!url} style={{ width: 120, flex: 'none', opacity: url ? 1 : 0.5 }} onClick={() => { navigator.clipboard?.writeText(url); close() }}>Copy link</button>
        </div>
        {/* Everything is in the link itself, so "live" can't be honest yet. */}
        <div style={{ font: '400 12.5px/1.45 Archivo, sans-serif', color: 'var(--ink-3)', textAlign: 'center', marginTop: 10 }}>
          The link carries the list itself — it works with no account, but photos stay on your phone.
        </div>
      </div>
    </div>
  )
}

/* 3e — What the receiver sees, in a browser, with no app */
export function PublicList({ list, places, onKeep, onBack, onDelete, others = () => [] }) {
  return (
    <div className="screen">
      <div className="scroll">
        <Hero height={200} src={places[0]?.photos?.[0]} onBack={onBack}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="avatar" style={{ width: 22, height: 22, fontSize: 10.5 }}>{list.initials || initialsOf(list.by)}</div>
            <span className="eyebrow" style={{ color: 'rgba(243,241,235,.75)' }}>{(list.by || 'SOMEONE').toUpperCase()} RECOMMENDS</span>
          </div>
          <div style={{ font: '700 28px/1.14 Archivo, sans-serif', letterSpacing: '-.03em', color: 'var(--paper)', marginTop: 8 }}>{list.title}</div>
        </Hero>
        <div style={{ padding: '15px 20px 0', font: '400 15.5px/1.55 Archivo, sans-serif', color: 'var(--ink-2)' }}>{list.blurb}</div>
        <div style={{ padding: '16px 20px 12px' }}>
          {places.map((p, i) => (
            <div key={p.id} style={{ borderBottom: i < places.length - 1 ? '1px solid var(--line)' : 0, paddingBottom: 14, paddingTop: i ? 14 : 0 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Photo src={p.photos?.[0]} size={60} radius={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                    <span style={{ font: '700 17.5px/1.2 Archivo, sans-serif', letterSpacing: '-.015em' }}>{p.name}</span>
                    <Kind k={p.kind} />
                    <Stars n={p.stars} size={12} />
                  </div>
                  <div style={{ font: '400 14.5px/1.45 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 4 }}>{p.note}</div>
                  {!!others(p).length && (
                    <div className="meta" style={{ marginTop: 7 }}>ALSO FROM {others(p).map((o) => o.by).join(' · ').toUpperCase()}</div>
                  )}
                  <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                    <a href={mapsUrl(p)} style={{ font: '600 12.5px Archivo, sans-serif', color: 'var(--blue)', textDecoration: 'none' }}>Open in Maps</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '13px 20px calc(var(--bottom) + 14px)', background: 'rgba(243,241,235,.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn btn-ink" onClick={onKeep}>{Icon.down()} Keep these {places.length} places</button>
          {/* Only when it's a list in your inbox — the browser view has nothing to delete. */}
          {onDelete && (
            <button className="btn btn-plain" onClick={onDelete} aria-label={`Delete ${list.title}`} style={{ width: 50, flex: 'none' }}>{Icon.trash()}</button>
          )}
        </div>
        <div style={{ font: '400 13px/1.5 Archivo, sans-serif', color: 'var(--ink-3)', textAlign: 'center', marginTop: 9 }}>
          Works in the browser. The app is only if you want to save your own.
        </div>
      </div>
    </div>
  )
}

/* 3f — A place: your note, first */
export function PlaceScreen({ place, back, onSend, onEdit, others = [] }) {
  return (
    <div className="screen">
      <div className="scroll">
        <Hero height={260} src={place.photos?.[0]} onBack={back} />
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ font: '700 27px/1.15 Archivo, sans-serif', letterSpacing: '-.028em' }}>{place.name}</div>
            <Kind k={place.kind} />
          </div>
          {!!place.stars && <div style={{ marginTop: 9 }}><Stars n={place.stars} size={17} /></div>}
          <div className="meta" style={{ marginTop: 8, letterSpacing: '.04em' }}>{[place.address, place.area].filter(Boolean).join(' · ').toUpperCase()}</div>

          <div className="card" style={{ marginTop: 16, padding: '14px 15px' }}>
            <div className="eyebrow">YOUR NOTE</div>
            <div style={{ font: '400 17px/1.55 Archivo, sans-serif', marginTop: 9 }}>{place.note}</div>
            {!!place.tags?.length && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                {place.tags.map((t) => <span key={t} className="pill" style={{ fontSize: 13, padding: '5px 10px' }}>{t}</span>)}
              </div>
            )}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <a className="btn btn-plain" style={{ height: 44, borderRadius: 11, fontSize: 15, textDecoration: 'none' }} href={mapsUrl(place)}>{Icon.pin('#2E6FA8')} Maps</a>
            {/* No number, no buttons — a Call that can't dial reads as broken. */}
            {!!place.phone && (
              <>
                <a className="btn btn-plain" style={{ height: 44, borderRadius: 11, fontSize: 15, textDecoration: 'none' }} href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}>{Icon.phone()} Call</a>
                {/* wa.me wants digits only, country code included, no plus. */}
                <a className="btn btn-plain" style={{ height: 44, borderRadius: 11, fontSize: 15, textDecoration: 'none' }} href={`https://wa.me/${place.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{Icon.whatsapp()} WhatsApp</a>
              </>
            )}
            {!!place.instagram && (
              <a className="btn btn-plain" style={{ height: 44, borderRadius: 11, fontSize: 15, textDecoration: 'none' }} href={`https://instagram.com/${place.instagram}`} target="_blank" rel="noreferrer">{Icon.instagram()} @{place.instagram}</a>
            )}
            <button className="btn btn-plain" onClick={onEdit} style={{ height: 44, borderRadius: 11, fontSize: 15 }}>{Icon.pencil()} Edit</button>
          </div>

          {!!others.length && (
            <>
              <div className="eyebrow" style={{ marginTop: 22 }}>ALSO SENT TO YOU BY {others.length} {others.length === 1 ? 'PERSON' : 'PEOPLE'}</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {others.map((o) => (
                  <div key={o.id} className="card" style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 11.5, flex: 'none' }}>{o.initials}</div>
                      <div style={{ font: '600 15.5px Archivo, sans-serif', flex: 1 }}>{o.by}</div>
                      <Stars n={o.stars} size={13} />
                    </div>
                    <div style={{ font: '400 15.5px/1.5 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 9 }}>{o.note}</div>
                    {!!o.tags?.length && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {o.tags.map((t) => <span key={t} className="pill" style={{ fontSize: 12.5, padding: '4px 9px' }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {place.sent > 0 && <div className="meta" style={{ marginTop: 20 }}>YOU'VE SENT THIS {place.sent}×</div>}
        </div>
      </div>
      <div style={{ padding: '12px 20px calc(var(--bottom) + 14px)' }}>
        <button className="btn btn-orange" onClick={onSend}>{Icon.share()} Send this place</button>
      </div>
    </div>
  )
}

/* 3g — Someone asks you: answer in two taps */
export function AnswerAsk({ state, back, onSend }) {
  // The ask mentions a toddler → the "Kids fine" tag does the filtering.
  const matched = state.places.filter((p) => p.tags?.includes('Kids fine'))
  const auto = { id: 'auto', title: 'Lisbon with kids', placeIds: matched.map((p) => p.id), sent: 0, blurb: 'Places I tagged kids fine.', updated: 'now', live: true, slug: 'lisbon-kids' }
  const options = [auto, ...state.lists]
  const [picked, setPicked] = useState('auto')
  const chosen = options.find((o) => o.id === picked)

  return (
    <div className="screen">
      <TopBar onBack={back} title="Noa Adler" />
      <div className="scroll" style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', gap: 11 }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, flex: 'none' }}>NA</div>
          <div style={{ flex: 1 }}>
            <div className="card" style={{ borderRadius: '4px 13px 13px 13px', padding: '13px 14px', font: '400 16.5px/1.5 Archivo, sans-serif' }}>
              We're in Lisbon Thursday to Sunday with the toddler. Where do we eat? 🙏
            </div>
            <div className="meta" style={{ marginTop: 7 }}>09:14</div>
          </div>
        </div>

        <div style={{ marginTop: 22, padding: '13px 14px', background: 'var(--fill)', borderRadius: 12 }}>
          <div className="eyebrow">FROM YOUR PLACES · {state.places.length} IN LISBON</div>
          <div style={{ font: '400 14.5px/1.5 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 8 }}>
            {matched.length} of them you tagged <strong style={{ color: 'var(--ink)' }}>Kids fine</strong>. Send those, or send the whole list.
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((o) => {
            const on = picked === o.id
            return (
              <button key={o.id} onClick={() => setPicked(o.id)} className="card" style={{ border: on ? '1.5px solid var(--orange)' : undefined, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <Photo size={44} radius={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 16px Archivo, sans-serif' }}>{o.title}</div>
                  <div className="meta" style={{ marginTop: 5 }}>{o.placeIds.length} PLACES · {o.id === 'auto' ? 'AUTO-BUILT' : `SENT ${o.sent}×`}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flex: 'none', background: on ? 'var(--orange)' : 'transparent', border: on ? 0 : '1.5px solid rgba(16,19,20,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && Icon.check()}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '12px 20px calc(var(--bottom) + 14px)', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-orange" onClick={() => onSend(chosen)}>Send “{chosen.title}” {Icon.right()}</button>
      </div>
    </div>
  )
}

/* 3h — the location ask, at the moment it pays off */
export function LocationSheet({ onAllow, onDecline }) {
  return (
    <div className="sheet">
      <div className="sheet-body" style={{ paddingInline: 22 }}>
        <div className="grabber" />
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.locate()}</div>
        <div style={{ font: '700 23px/1.22 Archivo, sans-serif', letterSpacing: '-.025em', marginTop: 16 }}>Use your location to save faster</div>
        <div style={{ font: '400 15.5px/1.55 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 9 }}>
          We'll fill in where you're standing, so saving a place is one line of typing. Never shared with anyone — not even on lists you send.
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <button className="btn btn-orange" onClick={onAllow}>Allow while using the app</button>
          <button className="btn btn-plain" onClick={onDecline}>I'll type it myself</button>
        </div>
      </div>
    </div>
  )
}

/* 3h — offline banner */
export function OfflineBanner({ queued }) {
  return (
    <div style={{ position: 'absolute', top: 'calc(var(--top) + 6px)', left: 16, right: 16, zIndex: 30, padding: '9px 13px', borderRadius: 10, background: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10 }}>
      {Icon.offline()}
      <div style={{ flex: 1 }}>
        <div style={{ font: '600 14.5px Archivo, sans-serif', color: 'var(--paper)' }}>No signal{queued ? ` — ${queued} places waiting` : ''}</div>
        <div style={{ font: '400 12.5px Archivo, sans-serif', color: '#767C7F', marginTop: 2 }}>They'll upload when you're back online</div>
      </div>
    </div>
  )
}

/* Lists index — reached from the avatar; not a design screen, the shortest way
   to make lists and "someone asks you" reachable from the app. */
export function Lists({ state, back, go, onRename }) {
  return (
    <div className="screen">
      <TopBar
        onBack={back}
        title={state.me.name}
        right={<button onClick={onRename} style={{ font: '500 15px Archivo, sans-serif', color: 'var(--green)' }}>Change name</button>}
      />
      <div className="scroll" style={{ padding: '18px 20px' }}>
        <div className="eyebrow">MY LISTS</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.lists.map((l) => (
            <button key={l.id} className="card" onClick={() => go({ name: 'list', id: l.id })} style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
              <Photo size={52} radius={9} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 16.5px Archivo, sans-serif' }}>{l.title}</div>
                <div className="meta" style={{ marginTop: 5 }}>{l.placeIds.length} PLACES · SENT {l.sent}×</div>
              </div>
            </button>
          ))}
        </div>
        <div className="eyebrow" style={{ marginTop: 26 }}>INBOX</div>
        <button className="card" onClick={() => go({ name: 'ask' })} style={{ marginTop: 12, padding: 12, display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', width: '100%' }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 15, flex: 'none' }}>NA</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 16px Archivo, sans-serif' }}>Noa Adler</div>
            <div style={{ font: '400 14px/1.4 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Where do we eat in Lisbon?</div>
          </div>
        </button>
      </div>
    </div>
  )
}

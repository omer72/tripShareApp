// Seed content lifted from the design doc (turn 3). Persisted to localStorage.
const KEY = 'metromosaic.v1'

export const TAGS = ['Worth a detour', 'Book ahead', 'Kids fine', 'Cheap', 'Cash only']
export const KINDS = { EAT: '#E2552B', SEE: '#1B5E4B', DRINK: '#8A8F92' }

const seed = {
  me: { name: 'Omer' },
  places: [
    { id: 'p1', stars: 5, phone: '+351 21 886 1234', name: 'Casa Boa', kind: 'EAT', area: 'Alfama', address: 'R. dos Bacalhoeiros 12, Alfama', city: 'Lisbon', country: 'Portugal', note: "Go at six, before the queue. Clams, extra bread, cash only. If it's full, the place two doors down is the same family.", tags: ['Worth a detour', 'Cheap', 'Cash only'], sent: 7, photos: [] },
    { id: 'p2', stars: 4, name: 'Miradouro da Graça', kind: 'SEE', area: 'Graça', address: 'Calçada da Graça, Graça', city: 'Lisbon', country: 'Portugal', note: 'Sunset side is the left bench. Kiosk wine is fine and cheap.', tags: ['Cheap', 'Kids fine'], sent: 4, photos: [] },
    { id: 'p3', stars: 4, name: 'Museu do Azulejo', kind: 'SEE', area: 'Beato', address: 'R. da Madre de Deus 4, Beato', city: 'Lisbon', country: 'Portugal', note: 'Go straight upstairs. The cloister café is the actual reason to come.', tags: ['Kids fine'], sent: 2, photos: [] },
    { id: 'p4', stars: 5, phone: '+351 21 396 7755', name: 'Aloma', kind: 'EAT', area: 'Campo de Ourique', address: 'R. Francisco Metrass 67', city: 'Lisbon', country: 'Portugal', note: 'Better custard tarts than the famous one, and no line.', tags: ['Cheap', 'Kids fine'], sent: 6, photos: [] },
    { id: 'p5', stars: 3, name: 'Pensão Amor', kind: 'DRINK', area: 'Cais do Sodré', address: 'R. do Alecrim 19', city: 'Lisbon', country: 'Portugal', note: 'Go for the room, not the cocktails.', tags: [], sent: 0, photos: [] },
    { id: 'p6', stars: 4, phone: '+351 22 202 8000', name: 'Casa Xica', kind: 'EAT', area: 'Bonfim', address: 'R. de São Vítor 46', city: 'Porto', country: 'Portugal', note: 'Order the picanha, sit outside, stay for the second bottle.', tags: ['Cheap'], sent: 2, photos: [] },
    { id: 'p7', stars: 4, name: 'Bar Brutus', kind: 'DRINK', area: 'Cedofeita', address: 'R. de Cedofeita 96', city: 'Porto', country: 'Portugal', note: 'Natural wine, no attitude. The only Porto bar I send people to.', tags: [], sent: 1, photos: [] },
    { id: 'p8', stars: 4, phone: '+34 933 68 2331', name: 'Bar Nou', kind: 'DRINK', area: 'Gràcia', address: "C/ de Ros d'Olano 9", city: 'Barcelona', country: 'Spain', note: 'Vermouth at noon, tinned fish, nothing complicated.', tags: ['Cheap'], sent: 3, photos: [] },
    { id: 'p9', stars: 5, name: 'Bunkers del Carmel', kind: 'SEE', area: 'El Carmel', address: 'Carrer de Marià Labèrnia', city: 'Barcelona', country: 'Spain', note: 'Walk up an hour before sunset. Bring your own beer, there is no kiosk.', tags: ['Cheap', 'Kids fine'], sent: 5, photos: [] },
  ],
  // Lists other people sent you. Self-contained places, so nothing leaks into
  // yours until you keep them.
  shared: [
    {
      id: 's1', by: 'Noa Adler', initials: 'NA', title: 'Rome, the short version', updated: 'Apr',
      blurb: 'Four days, no queues, one museum. Everything else is dinner.',
      places: [
        { id: 's1p1', stars: 5, name: 'Roscioli', kind: 'EAT', area: 'Regola', address: 'Via dei Giubbonari 21', city: 'Rome', country: 'Italy', note: 'Book two weeks out or eat at the counter at 7. The cacio e pepe is the point.', tags: ['Book ahead'], photos: [] },
        { id: 's1p2', stars: 5, name: 'Galleria Borghese', kind: 'SEE', area: 'Pinciano', address: 'Piazzale Scipione Borghese 5', city: 'Rome', country: 'Italy', note: 'Two-hour slots, book ahead. Go at the last slot, the light is better.', tags: ['Book ahead', 'Worth a detour'], photos: [] },
        { id: 's1p3', stars: 3, name: 'Bar San Calisto', kind: 'DRINK', area: 'Trastevere', address: 'Piazza di San Calisto 3', city: 'Rome', country: 'Italy', note: 'Three euro beers on the piazza. Nobody is there for the service.', tags: ['Cheap', 'Cash only'], photos: [] },
      ],
    },
    {
      id: 's3', by: 'Maya Cohen', initials: 'MC', title: 'Lisbon, if you only eat', updated: 'May',
      blurb: 'Two days, six meals, no monuments.',
      places: [
        { id: 's3p1', stars: 4, name: 'Casa Boa', kind: 'EAT', area: 'Alfama', address: 'R. dos Bacalhoeiros 12, Alfama', city: 'Lisbon', country: 'Portugal', note: 'Ask for the tomato rice even though it is not written up. Go on a Tuesday, the weekend is a scrum.', tags: ['Cash only'], photos: [] },
        { id: 's3p2', stars: 5, name: 'Aloma', kind: 'EAT', area: 'Campo de Ourique', address: 'R. Francisco Metrass 67', city: 'Lisbon', country: 'Portugal', note: 'Two tarts each, they are small. Coffee standing at the counter.', tags: ['Cheap'], photos: [] },
      ],
    },
    {
      id: 's4', by: 'Ori Ben-David', initials: 'OB', title: 'Lisbon for a weekend', updated: 'Mar',
      blurb: "What I'd do with 48 hours and no plan.",
      places: [
        { id: 's4p1', stars: 5, name: 'Casa Boa', kind: 'EAT', area: 'Alfama', address: 'R. dos Bacalhoeiros 12, Alfama', city: 'Lisbon', country: 'Portugal', note: 'Cash only and they mean it — the ATM up the hill charges. Clams, then the pork.', tags: ['Cash only', 'Worth a detour'], photos: [] },
        { id: 's4p2', stars: 4, name: 'Miradouro da Graça', kind: 'SEE', area: 'Graça', address: 'Calçada da Graça, Graça', city: 'Lisbon', country: 'Portugal', note: 'Skip it at sunset, it is a crowd. Go at nine in the morning with a coffee.', tags: ['Cheap'], photos: [] },
      ],
    },
    {
      id: 's2', by: 'Dan Levy', initials: 'DL', title: 'Tokyo without the list', updated: 'Feb',
      blurb: "The places I'd go back to, not the ones everyone writes about.",
      places: [
        { id: 's2p1', stars: 4, name: 'Bar Trench', kind: 'DRINK', area: 'Ebisu', address: '1-5-8 Ebisunishi', city: 'Tokyo', country: 'Japan', note: 'Tiny, smoky, excellent. Sit at the bar and let them pick.', tags: [], photos: [] },
        { id: 's2p2', stars: 5, name: 'Tonki', kind: 'EAT', area: 'Meguro', address: '1-1-2 Shimomeguro', city: 'Tokyo', country: 'Japan', note: 'Tonkatsu, one thing on the menu, cash. The queue moves fast.', tags: ['Cash only', 'Worth a detour'], photos: [] },
      ],
    },
  ],
  lists: [
    { id: 'l1', title: 'Lisbon, 3 days', blurb: "What I send people who have a long weekend and don't want to queue for anything.", placeIds: ['p1', 'p2', 'p3', 'p4'], sent: 12, updated: 'Mar', live: true, slug: 'lisbon-3d' },
    { id: 'l2', title: 'Best meals', blurb: 'The meals I still think about.', placeIds: ['p1', 'p4'], sent: 3, updated: 'Jan', live: true, slug: 'best-meals' },
  ],
}

const countryOf = Object.fromEntries(seed.places.map((p) => [p.city, p.country]))

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed
    const saved = JSON.parse(raw)
    // Places saved before countries existed: take it from the city, else Elsewhere.
    if (saved.places) saved.places = saved.places.map((p) => (p.country ? p : { ...p, country: countryOf[p.city] ?? '' }))
    return { ...seed, ...saved }
  } catch {
    return seed
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ places: state.places, lists: state.lists, me: state.me }))
  } catch (e) {
    // Full quota mustn't take the app down — the in-memory state is still correct.
    // ponytail: photos are the only thing big enough to hit this; move them out of
    // localStorage (Filesystem plugin / a backend) if it starts happening for real.
    console.warn('Not saved:', e?.message)
  }
}

// Camera-roll originals are multi-megabyte and localStorage caps around 5MB, so
// downscale to a long edge of 900px before keeping one.
export function shrink(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error("That file isn't an image we can read.")) }
    img.src = URL.createObjectURL(file)
  })
}

// Instagram nametag codes encode a profile URL; the handle is the last path
// segment, minus the /_u/ prefix Instagram uses to open its own app. Anything
// that isn't a plausible handle comes back empty rather than half-parsed.
export function instagramHandle(text = '') {
  const path = String(text).trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^_u\//, '')
  const handle = path.split(/[?#/]/).filter(Boolean)[0] ?? ''
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : ''
}

// Country name → flag, without shipping a lookup table: ask Intl what every ISO
// code is called once, then build the flag out of the code's regional indicators.
// Anything unrecognised just gets no flag.
const flags = (() => {
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  const out = {}
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b)
      const name = names.of(code)
      if (name && name !== code) out[name.toLowerCase()] = String.fromCodePoint(0x1f1e6 + a - 65, 0x1f1e6 + b - 65)
    }
  }
  return out
})()

export const flagOf = (country) => flags[(country ?? '').trim().toLowerCase()] ?? ''

// Countries → cities → count, derived from the places themselves. No separate
// geography model to keep in step, and a place with neither still shows up.
export function byCountry(places) {
  const out = {}
  for (const p of places) {
    const country = p.country || 'Elsewhere'
    const city = p.city || 'Elsewhere'
    out[country] ??= {}
    out[country][city] = (out[country][city] ?? 0) + 1
  }
  return out
}

// Each sender's copy of a place has its own id, so the same restaurant is matched
// on name + city. Anything stricter (coordinates, an address string) and two
// people who typed it differently stop lining up.
// Initials from whatever name you set — no second field to keep in step.
export const initialsOf = (name = '') =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('') || '?'

export const placeKey = (p) => `${(p.name ?? '').trim().toLowerCase()}|${(p.city ?? '').trim().toLowerCase()}`

// What everyone else wrote about this place. Their note verbatim — the whole
// point is that two people say different things about the same door.
export const otherNotes = (place, shared = []) =>
  shared.flatMap((s) =>
    s.places
      .filter((p) => placeKey(p) === placeKey(place) && p.note !== place.note)
      .map((p) => ({ id: `${s.id}-${p.id}`, by: s.by, initials: s.initials, note: p.note, stars: p.stars, tags: p.tags })),
  )

// Where the receiver view is hosted. One line to change once Vercel gives you a
// domain — the app itself never talks to it, links just point at it.
export const SITE = 'https://trip-share-app-pink.vercel.app'

// A sent link carries the whole list in its fragment: no backend, and the link
// keeps working forever. Fragments never reach a server, so nothing is logged.
// Short keys and deflate keep it to roughly a kilobyte for a dozen places.
// ponytail: photos are left out — one data URL is bigger than everything else
// combined. They need somewhere to live before they can travel.
const FIELDS = { n: 'name', k: 'kind', a: 'address', c: 'city', o: 'country', r: 'note', g: 'tags', s: 'stars', h: 'phone', i: 'instagram', e: 'area' }

const b64 = (bytes) => {
  let out = ''
  for (let i = 0; i < bytes.length; i += 8192) out += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const unb64 = (text) =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

const through = async (bytes, transform) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(transform)).arrayBuffer())

export async function packList({ title, blurb, by, places }) {
  const packed = {
    t: title,
    b: blurb,
    y: by,
    p: places.map((place) => {
      const out = {}
      for (const [short, field] of Object.entries(FIELDS)) if (place[field]) out[short] = place[field]
      return out
    }),
  }
  const bytes = new TextEncoder().encode(JSON.stringify(packed))
  return b64(await through(bytes, new CompressionStream('deflate-raw')))
}

export async function unpackList(text) {
  const bytes = await through(unb64(text), new DecompressionStream('deflate-raw'))
  const packed = JSON.parse(new TextDecoder().decode(bytes))
  const by = packed.y ?? ''
  return {
    list: {
      title: packed.t ?? 'A list',
      blurb: packed.b ?? '',
      by,
      initials: by.split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join(''),
    },
    places: (packed.p ?? []).map((row, i) => {
      const place = { id: `in${i}`, photos: [] }
      for (const [short, field] of Object.entries(FIELDS)) if (row[short] !== undefined) place[field] = row[short]
      return place
    }),
  }
}

export const shareUrl = async (list, places, by) => `${SITE}/#l=${await packList({ ...list, by, places })}`

// Editing a place: list membership becomes whatever the chips say — added where
// ticked, dropped where not, order kept for the lists it was already in.
export const setMembership = (lists, id, listIds) =>
  lists.map((l) => ({
    ...l,
    placeIds: listIds.includes(l.id)
      ? (l.placeIds.includes(id) ? l.placeIds : [...l.placeIds, id])
      : l.placeIds.filter((x) => x !== id),
  }))

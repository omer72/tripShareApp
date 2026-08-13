// node test.js — the only logic worth a check: seeded state survives a
// localStorage roundtrip, and tags are what the auto-list filters on.
import assert from 'node:assert/strict'

const store = {}
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v },
}

const { load, save, shareUrl, setMembership, byCountry, otherNotes, flagOf, instagramHandle, unpackList, SITE } = await import('./src/data.js')

const seeded = load()
assert.equal(seeded.places.length, 9)
// A sent link carries the list in its fragment and comes back out intact.
const link = await shareUrl(seeded.lists[0], seeded.places.slice(0, 4), 'Tamar R.')
assert.ok(link.startsWith(`${SITE}/#l=`))
assert.ok(link.length < 2000, `link is ${link.length} chars — too long to send`)
const back = await unpackList(link.split('#l=')[1])
assert.equal(back.list.title, 'Lisbon, 3 days')
assert.equal(back.list.by, 'Tamar R.')
assert.equal(back.list.initials, 'TR')
assert.deepEqual(back.places.map((p) => p.name), seeded.places.slice(0, 4).map((p) => p.name))
assert.equal(back.places[0].note, seeded.places[0].note)
assert.equal(back.places[0].stars, 5)
assert.equal(back.places[0].phone, '+351 21 886 1234')
// Photos are deliberately left behind — they'd dwarf the link.
assert.deepEqual(back.places[0].photos, [])
await assert.rejects(() => unpackList('not-a-real-payload'))

// A saved place lands in the picked list and comes back after a reload.
const place = { id: 'p9x', name: 'Adega Sete', note: 'Sit at the bar', kind: 'EAT', tags: ['Kids fine'], city: 'Lisbon' }
save({
  places: [place, ...seeded.places],
  lists: seeded.lists.map((l) => (l.id === 'l1' ? { ...l, placeIds: [...l.placeIds, 'p9x'] } : l)),
})

// Countries → cities → count, with a place missing both still landing somewhere.
const tree = byCountry([...seeded.places, { id: 'px' }])
assert.deepEqual(tree.Portugal, { Lisbon: 5, Porto: 2 })
assert.deepEqual(tree.Spain, { Barcelona: 2 })
assert.deepEqual(tree.Elsewhere, { Elsewhere: 1 })

const reloaded = load()
assert.equal(reloaded.places.length, 10)
// The place saved without a country gets one from its city.
assert.equal(reloaded.places.find((p) => p.id === 'p9x').country, 'Portugal')
assert.ok(reloaded.lists.find((l) => l.id === 'l1').placeIds.includes('p9x'))
assert.deepEqual(reloaded.places.filter((p) => p.tags.includes('Kids fine')).map((p) => p.name),
  ['Adega Sete', 'Miradouro da Graça', 'Museu do Azulejo', 'Aloma', 'Bunkers del Carmel'])

// Two people sent the same place: both their notes come back, matched on name +
// city, and your own copy's note isn't repeated as someone else's.
const casaBoa = seeded.places.find((p) => p.name === 'Casa Boa')
const notes = otherNotes(casaBoa, seeded.shared)
assert.deepEqual(notes.map((o) => o.by), ['Maya Cohen', 'Ori Ben-David'])
assert.ok(notes.every((o) => o.note !== casaBoa.note))
assert.equal(otherNotes({ name: 'Casa Boa', city: 'Porto' }, seeded.shared).length, 0)

// Whatever the nametag code holds, we want the bare handle — or nothing.
assert.equal(instagramHandle('https://www.instagram.com/_u/casaboa/'), 'casaboa')
assert.equal(instagramHandle('https://instagram.com/casa.boa?igsh=xyz'), 'casa.boa')
assert.equal(instagramHandle('@casaboa'), 'casaboa')
assert.equal(instagramHandle('https://example.com/casaboa'), '')
assert.equal(instagramHandle(''), '')

// Flags come from the country name, and an unknown one is simply flagless.
assert.equal(flagOf('Portugal'), '\u{1F1F5}\u{1F1F9}')
assert.equal(flagOf(' japan '), '\u{1F1EF}\u{1F1F5}')
assert.equal(flagOf('Elsewhere'), '')
assert.equal(flagOf(undefined), '')

// Editing a place: ticked lists gain it, unticked lose it, already-in stays put once.
const edited = setMembership(reloaded.lists, 'p1', ['l2'])
assert.ok(!edited.find((l) => l.id === 'l1').placeIds.includes('p1'))
assert.deepEqual(edited.find((l) => l.id === 'l2').placeIds, ['p1', 'p4'])

console.log('ok')

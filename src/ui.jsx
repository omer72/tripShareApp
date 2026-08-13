import { KINDS } from './data'

const s = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Icon = {
  back: (c = '#101314') => <svg width="17" height="17" viewBox="0 0 18 18" {...s}><path d="M11 3.5L5.5 9l5.5 5.5" stroke={c} strokeWidth="1.8" {...s} /></svg>,
  share: (c = '#fff') => <svg width="16" height="16" viewBox="0 0 16 16" {...s}><path d="M8 10.5V2M4.5 5.5L8 2l3.5 3.5" stroke={c} strokeWidth="1.7" {...s} /><path d="M2.5 10v3a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3" stroke={c} strokeWidth="1.7" {...s} /></svg>,
  down: (c = '#F3F1EB') => <svg width="16" height="16" viewBox="0 0 16 16" {...s}><path d="M8 2v8.5M4.5 7L8 10.5 11.5 7" stroke={c} strokeWidth="1.7" {...s} /><path d="M2.5 11.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1.5" stroke={c} strokeWidth="1.7" {...s} /></svg>,
  plus: (c = '#fff', w = 20) => <svg width={w} height={w} viewBox="0 0 20 20" {...s}><path d="M10 4v12M4 10h12" stroke={c} strokeWidth="2.1" {...s} /></svg>,
  pin: (c = '#E2552B') => <svg width="17" height="17" viewBox="0 0 18 18" {...s}><path d="M9 16s5.5-4.9 5.5-9A5.5 5.5 0 0 0 3.5 7c0 4.1 5.5 9 5.5 9z" stroke={c} strokeWidth="1.6" {...s} /><circle cx="9" cy="7" r="2" stroke={c} strokeWidth="1.6" fill="none" /></svg>,
  phone: (c = '#1B5E4B') => <svg width="15" height="15" viewBox="0 0 16 16" {...s}><path d="M3 3.5h3l1.2 3-1.6 1.2a8 8 0 0 0 3.7 3.7L10.5 10l3 1.2v3A11 11 0 0 1 3 3.5z" stroke={c} strokeWidth="1.5" {...s} /></svg>,
  whatsapp: (c = '#25A366') => <svg width="16" height="16" viewBox="0 0 16 16" {...s}><path d="M2.6 13.4l.8-2.8A5.4 5.4 0 1 1 5.5 12.6l-2.9.8z" stroke={c} strokeWidth="1.5" {...s} /><path d="M6.1 5.6c.2 1 .6 1.8 1.3 2.5s1.5 1.1 2.5 1.3l.6-.9 1.2.5c-.1.7-.7 1.2-1.4 1.2-2.4 0-4.9-2.5-4.9-4.9 0-.7.5-1.3 1.2-1.4l.5 1.2z" fill={c} stroke="none" /></svg>,
  instagram: (c = '#C13584') => <svg width="15" height="15" viewBox="0 0 16 16" {...s}><rect x="2" y="2" width="12" height="12" rx="3.5" stroke={c} strokeWidth="1.5" fill="none" /><circle cx="8" cy="8" r="2.8" stroke={c} strokeWidth="1.5" fill="none" /><circle cx="11.6" cy="4.4" r=".8" fill={c} /></svg>,
  trash: (c = '#8A8F92') => <svg width="15" height="15" viewBox="0 0 16 16" {...s}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2" stroke={c} strokeWidth="1.4" {...s} /></svg>,
  pencil: (c = '#6B7075') => <svg width="15" height="15" viewBox="0 0 16 16" {...s}><path d="M12 2.5L14.5 5l-8 8H4v-2.5l8-8z" stroke={c} strokeWidth="1.5" {...s} /></svg>,
  check: (c = '#fff') => <svg width="12" height="12" viewBox="0 0 12 12" {...s}><path d="M2.5 6.2l2.4 2.4L9.5 4" stroke={c} strokeWidth="1.8" {...s} /></svg>,
  right: (c = '#fff') => <svg width="16" height="16" viewBox="0 0 16 16" {...s}><path d="M3 8h9M8.5 4l4 4-4 4" stroke={c} strokeWidth="1.8" {...s} /></svg>,
  camera: (w = 22) => <svg width={w} height={w} viewBox="0 0 20 20" {...s}><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#A8A398" strokeWidth="1.5" fill="none" /><circle cx="7" cy="8.5" r="1.4" fill="#A8A398" /><path d="M3.5 14l4-4 3.5 3.5 2.5-2 3 2.5" stroke="#A8A398" strokeWidth="1.5" {...s} /></svg>,
  offline: () => <svg width="15" height="15" viewBox="0 0 16 16" {...s}><path d="M8 12.5h.01" stroke="#E2552B" strokeWidth="2" {...s} /><path d="M5.4 9.9a3.7 3.7 0 0 1 5.2 0M2.8 7.3a7.4 7.4 0 0 1 10.4 0" stroke="#767C7F" strokeWidth="1.5" {...s} /><path d="M2 2l12 12" stroke="#E2552B" strokeWidth="1.5" {...s} /></svg>,
  locate: () => <svg width="24" height="24" viewBox="0 0 24 24" {...s}><path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z" stroke="#E2552B" strokeWidth="1.8" {...s} /><circle cx="12" cy="9.5" r="2.6" stroke="#E2552B" strokeWidth="1.8" fill="none" /></svg>,
}

export const Kind = ({ k }) => (k ? <span className="kind" style={{ color: KINDS[k] }}>{k}</span> : null)

const star = (on, w) => (
  <svg width={w} height={w} viewBox="0 0 20 20">
    <path d="M10 1.7l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8z"
      fill={on ? '#E2552B' : 'none'} stroke={on ? '#E2552B' : 'rgba(16,19,20,.25)'} strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

// 1–5 stars. Read-only unless given onPick; tapping the current rating clears it.
export function Stars({ n = 0, size = 14, onPick }) {
  if (!n && !onPick) return null
  return (
    <span style={{ display: 'inline-flex', gap: onPick ? 8 : 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) =>
        onPick
          ? <button key={i} onClick={() => onPick(n === i ? 0 : i)} aria-label={`${i} star${i > 1 ? 's' : ''}`} style={{ display: 'flex' }}>{star(i <= n, size)}</button>
          : <span key={i} style={{ display: 'flex' }}>{star(i <= n, size)}</span>,
      )}
    </span>
  )
}

export function Photo({ src, size, radius = 10, style }) {
  const box = size ? { width: size, height: size } : {}
  return (
    <div className="photo" style={{ ...box, borderRadius: radius, ...style }}>
      {src ? <img src={src} alt="" /> : Icon.camera(size ? Math.max(14, size / 3.7) : 22)}
    </div>
  )
}

export function TopBar({ onBack, title, right }) {
  return (
    <div style={{ paddingTop: 'calc(var(--top) + 12px)', paddingBottom: 14, paddingInline: 20, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)', flex: 'none' }}>
      {onBack && <button onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>{Icon.back()}</button>}
      <div style={{ flex: 1, font: '600 16px Archivo, sans-serif' }}>{title}</div>
      {right}
    </div>
  )
}

// Photo hero with the gradient scrim + byline used by list and place screens.
export function Hero({ height, src, onBack, eyebrow, title, children }) {
  return (
    <div style={{ height, position: 'relative', background: 'var(--photo)', flex: 'none' }}>
      <Photo src={src} radius={0} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16,19,20,.82), rgba(16,19,20,0) 58%)', pointerEvents: 'none' }} />
      {onBack && (
        <button onClick={onBack} aria-label="Back" style={{ position: 'absolute', top: 'calc(var(--top) + 10px)', left: 16, width: 34, height: 34, borderRadius: '50%', background: 'rgba(16,19,20,.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.back('#F3F1EB')}
        </button>
      )}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16, pointerEvents: 'none' }}>
        {eyebrow && <div className="eyebrow" style={{ color: 'rgba(243,241,235,.7)', letterSpacing: '.15em' }}>{eyebrow}</div>}
        {title && <div style={{ font: '700 30px/1.12 Archivo, sans-serif', letterSpacing: '-.03em', color: 'var(--paper)', marginTop: 8 }}>{title}</div>}
        {children}
      </div>
    </div>
  )
}

// The one row shape the whole app reuses: photo, name + kind, your note, meta.
export function PlaceRow({ place, onClick, size = 56, boxed = false, footer, right }) {
  return (
    <button
      onClick={onClick}
      className={boxed ? 'card' : undefined}
      style={{ display: 'flex', gap: boxed ? 12 : 13, textAlign: 'left', width: '100%', padding: boxed ? 12 : '13px 0', alignItems: right ? 'center' : 'flex-start' }}
    >
      <Photo src={place.photos?.[0]} size={size} radius={boxed ? 10 : 9} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ font: '700 17.5px/1.2 Archivo, sans-serif', letterSpacing: '-.015em' }}>{place.name}</span>
          <Kind k={place.kind} />
          <Stars n={place.stars} size={12} />
        </div>
        <div style={{ font: '400 14.5px/1.45 Archivo, sans-serif', color: 'var(--ink-2)', marginTop: 4 }}>{place.note}</div>
        {footer}
      </div>
      {right}
    </button>
  )
}

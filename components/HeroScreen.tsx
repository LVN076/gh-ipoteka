'use client'
import { TEXTS } from '@/lib/config'

interface HeroScreenProps {
  onStart: () => void
}

export default function HeroScreen({ onStart }: HeroScreenProps) {
  return (
    <div className="screen-enter flex flex-col min-h-screen relative overflow-hidden">
      {/* Background architectural texture */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(160deg, #f9f8f5 0%, #f0ede4 50%, #e8e2d6 100%)' }} />

      {/* Decorative lines */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-px h-full opacity-20" style={{ background: 'linear-gradient(180deg, transparent, #c4a44a 40%, transparent)', right: '20%' }} />
        <div className="absolute top-0 right-0 w-px h-full opacity-10" style={{ background: 'linear-gradient(180deg, transparent, #c4a44a 60%, transparent)', right: '38%' }} />
      </div>

      {/* Abstract house silhouette */}
      <div className="absolute bottom-0 right-0 z-0 pointer-events-none opacity-8">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M140 20 L260 120 L260 260 L20 260 L20 120 Z" stroke="#c4a44a" strokeWidth="1" fill="none" opacity="0.15"/>
          <path d="M140 50 L240 135 L240 240 L40 240 L40 135 Z" stroke="#c4a44a" strokeWidth="0.5" fill="none" opacity="0.1"/>
          <rect x="110" y="180" width="60" height="80" stroke="#c4a44a" strokeWidth="0.5" fill="none" opacity="0.12"/>
        </svg>
      </div>

      {/* Header — логотип ГУД ХАУС */}
      <header className="relative z-10 px-6 pt-8 pb-4">
        <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}>
            ГУД ХАУС
          </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col flex-1 px-6 pt-8 pb-10">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 mb-8 self-start" style={{ border: '1px solid rgba(196, 164, 74, 0.4)', padding: '6px 12px', borderRadius: 'var(--radius)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c4a44a' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a8873a' }}>
            Льготная ипотека
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 10vw, 52px)', fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.15, whiteSpace: 'pre-line' }}>
          {TEXTS.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="mb-10" style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 300, lineHeight: 1.65, color: 'var(--color-text-muted)', maxWidth: '320px' }}>
          {TEXTS.hero.subtitle}
        </p>

        {/* Stats row */}
        <div className="flex gap-6 mb-12">
          {[
            { value: 'от 3%', label: 'ставка' },
            { value: '30 лет', label: 'срок' },
            { value: '10%', label: 'взнос от' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA Button */}
        <button onClick={onStart} className="btn-primary">
          {TEXTS.hero.cta}
          <svg className="ml-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className="mt-4 text-center" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', opacity: 0.7 }}>
          Бесплатно · Без регистрации · 1 минута
        </p>
      </main>
    </div>
  )
}

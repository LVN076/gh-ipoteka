'use client'

import { TEXTS, SITE_CONFIG } from '@/lib/config'

interface VKScreenProps {
  onConfirm: () => void
  onBack: () => void
}

export default function VKScreen({ onConfirm, onBack }: VKScreenProps) {
  const handleOpenVK = () => {
    window.open(SITE_CONFIG.vkGroupUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="screen-enter flex flex-col min-h-screen px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Good House
        </span>
      </header>

      {/* VK Logo block */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="flex items-center justify-center mb-6"
          style={{
            width: 80,
            height: 80,
            background: '#0077ff',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="white">
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1-1.49-.947-1.49-.947s-.609.047-.609 1.23v1.431h-1.032s-3.078.186-5.786-3.148C4.395 10.35 3.063 6.85 3.063 6.85s-.093-.234.026-.351c.09-.117.47-.117.47-.117h1.845c.37 0 .493.163.643.54 0 0 .912 2.508 2.238 4.011.934 1.077 1.453 1.344 1.453 1.344s.517.29.517-.702v-2.836c-.07-1.075-.56-1.151-.56-1.151s-.257-.047-.142-.233c.14-.187.373-.187.373-.187h3.427c.302 0 .37.233.37.607v3.827c0 .233.14.303.14.303s.54.118 1.197-.772c1.076-1.358 1.944-3.757 1.944-3.757s.094-.233.397-.233h1.845c.512 0 .62.281.49.607 0 0-.91 2.554-2.494 4.543-.745.957-.28.958.957 2.124 1.237 1.143 1.473 1.689 1.473 1.689s.653 1.028-.607 1.028z"/>
          </svg>
        </div>

        <h2
          className="mb-3 text-center leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 7vw, 36px)',
            fontWeight: 400,
            color: 'var(--color-text)',
          }}
        >
          {TEXTS.vkScreen.title}
        </h2>

        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 300,
            lineHeight: 1.65,
            color: 'var(--color-text-muted)',
            maxWidth: '300px',
          }}
        >
          {TEXTS.vkScreen.desc}
        </p>
      </div>

      {/* Benefits */}
      <div
        className="mb-10 p-5"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
        }}
      >
        {[
          'Проекты домов для любого бюджета',
          'Актуальные ипотечные ставки',
          'Новости и акции застройщиков',
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-3" style={{ marginBottom: i < 2 ? 12 : 0 }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(196, 164, 74, 0.15)' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4.5 7.5L8 2.5" stroke="#c4a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text)' }}>
              {benefit}
            </span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button onClick={handleOpenVK} className="btn-primary" style={{ background: '#0077ff' }}>
          <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1-1.49-.947-1.49-.947s-.609.047-.609 1.23v1.431h-1.032s-3.078.186-5.786-3.148C4.395 10.35 3.063 6.85 3.063 6.85s-.093-.234.026-.351c.09-.117.47-.117.47-.117h1.845c.37 0 .493.163.643.54 0 0 .912 2.508 2.238 4.011.934 1.077 1.453 1.344 1.453 1.344s.517.29.517-.702v-2.836c-.07-1.075-.56-1.151-.56-1.151s-.257-.047-.142-.233c.14-.187.373-.187.373-.187h3.427c.302 0 .37.233.37.607v3.827c0 .233.14.303.14.303s.54.118 1.197-.772c1.076-1.358 1.944-3.757 1.944-3.757s.094-.233.397-.233h1.845c.512 0 .62.281.49.607 0 0-.91 2.554-2.494 4.543-.745.957-.28.958.957 2.124 1.237 1.143 1.473 1.689 1.473 1.689s.653 1.028-.607 1.028z"/>
          </svg>
          {TEXTS.vkScreen.openVkButton}
        </button>

        <button onClick={onConfirm} className="btn-secondary">
          <svg className="mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {TEXTS.vkScreen.confirmButton}
        </button>
      </div>
    </div>
  )
}

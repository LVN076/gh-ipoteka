'use client'

import { TEXTS } from '@/lib/config'

interface AccessScreenProps {
  onVK: () => void
  onPhone: () => void
  onBack: () => void
}

export default function AccessScreen({ onVK, onPhone, onBack }: AccessScreenProps) {
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
        <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}>
            ГУД ХАУС
          </span>
      </header>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-1.5">
          <div className="w-6 h-0.5 rounded-full" style={{ background: 'var(--color-text)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
          Шаг 1 из 2
        </span>
      </div>

      {/* Title */}
      <h2
        className="mb-3 leading-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 8vw, 40px)',
          fontWeight: 400,
          color: 'var(--color-text)',
          lineHeight: 1.2,
          whiteSpace: 'pre-line',
        }}
      >
        {TEXTS.access.title}
      </h2>

      <p
        className="mb-12"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 300,
          lineHeight: 1.6,
          color: 'var(--color-text-muted)',
        }}
      >
        После этого вы сразу получите доступ к калькулятору
      </p>

      {/* Options */}
      <div className="flex flex-col gap-4 flex-1">
        {/* VK option */}
        <button
          onClick={onVK}
          className="flex items-start gap-4 p-5 text-left transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-text)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              width: 44,
              height: 44,
              background: '#0077ff',
              borderRadius: 'var(--radius)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1-1.49-.947-1.49-.947s-.609.047-.609 1.23v1.431h-1.032s-3.078.186-5.786-3.148C4.395 10.35 3.063 6.85 3.063 6.85s-.093-.234.026-.351c.09-.117.47-.117.47-.117h1.845c.37 0 .493.163.643.54 0 0 .912 2.508 2.238 4.011.934 1.077 1.453 1.344 1.453 1.344s.517.29.517-.702v-2.836c-.07-1.075-.56-1.151-.56-1.151s-.257-.047-.142-.233c.14-.187.373-.187.373-.187h3.427c.302 0 .37.233.37.607v3.827c0 .233.14.303.14.303s.54.118 1.197-.772c1.076-1.358 1.944-3.757 1.944-3.757s.094-.233.397-.233h1.845c.512 0 .62.281.49.607 0 0-.91 2.554-2.494 4.543-.745.957-.28.958.957 2.124 1.237 1.143 1.473 1.689 1.473 1.689s.653 1.028-.607 1.028z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              {TEXTS.access.vkButton}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}
            >
              {TEXTS.access.vkDesc}
            </div>
          </div>
          <svg className="flex-shrink-0 mt-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Divider */}
        <div className="divider">или</div>

        {/* Phone option */}
        <button
          onClick={onPhone}
          className="flex items-start gap-4 p-5 text-left transition-all"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-text)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              width: 44,
              height: 44,
              background: 'var(--color-text)',
              borderRadius: 'var(--radius)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1">
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              {TEXTS.access.phoneButton}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}
            >
              {TEXTS.access.phoneDesc}
            </div>
          </div>
          <svg className="flex-shrink-0 mt-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <p
        className="mt-8 text-center"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          opacity: 0.6,
        }}
      >
        Данные защищены и не передаются третьим лицам
      </p>
    </div>
  )
}


'use client'

import { TEXTS, SITE_CONFIG } from '@/lib/config'
import { CalculatorResult, formatCurrency } from '@/lib/mortgage'

interface ResultScreenProps {
  result: CalculatorResult
  input: {
    programName: string
    propertyPrice: number
    downPayment: number
    termYears: number
    rate: number
  }
  onRecalculate: () => void
  userName?: string
}

export default function ResultScreen({ result, input, onRecalculate, userName }: ResultScreenProps) {
  return (
    <div className="screen-enter flex flex-col min-h-screen px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center" style={{ border: '1px solid #c4a44a' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 5V11H7V8H5V11H1V5L6 1Z" fill="#c4a44a"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3L29 13V29H20V21H12V29H3V13L16 3Z" fill="none" stroke="#c4a44a" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M16 3L29 13V29H20V21H12V29H3V13L16 3Z" fill="rgba(196,164,74,0.12)"/>
            <path d="M10 13L16 8L22 13" stroke="#c4a44a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text)',
          }}>
            ГУД ХАУС
          </span>
        </div>
        </div>
      </header>

      {/* Step */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-1.5">
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="w-6 h-0.5 rounded-full" style={{ background: 'var(--color-gold)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>Результат</span>
      </div>

      {/* Congrats */}
      {userName && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          {userName}, ваш расчёт готов
        </p>
      )}

      {/* Main result card */}
      <div
        className="p-6 mb-6"
        style={{
          background: 'var(--color-text)',
          borderRadius: 'var(--radius)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M60 10L110 50V110H10V50L60 10Z" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          {TEXTS.result.monthlyLabel}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 10vw, 48px)',
            fontWeight: 400,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          {formatCurrency(result.monthlyPayment)}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          в месяц
        </p>

        {/* Gold accent line */}
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full" style={{ background: '#c4a44a' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {input.programName} · {input.rate}% годовых
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div
        className="p-5 mb-6"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}
      >
        {[
          { label: TEXTS.result.loanAmountLabel, value: formatCurrency(result.loanAmount) },
          { label: TEXTS.result.rateLabel, value: `${input.rate}% годовых` },
          { label: TEXTS.result.termLabel, value: `${input.termYears} лет (${result.termMonths} мес.)` },
          { label: 'Первоначальный взнос', value: `${formatCurrency(input.downPayment)} (${result.downPaymentPct}%)` },
          { label: TEXTS.result.totalLabel, value: formatCurrency(result.totalPayment) },
          { label: 'Переплата', value: formatCurrency(result.totalInterest) },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4"
            style={{
              paddingBottom: i < arr.length - 1 ? 12 : 0,
              marginBottom: i < arr.length - 1 ? 12 : 0,
              borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {item.label}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', textAlign: 'right', flexShrink: 0 }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <a
          href="tel:+79959129545"
          className="btn-gold"
          style={{ textDecoration: 'none' }}
        >
          <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
          </svg>
          {TEXTS.result.ctaButton}
        </a>

        <button onClick={onRecalculate} className="btn-secondary">
          <svg className="mr-2" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7A6 6 0 1 0 7 1M1 1v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {TEXTS.result.recalcButton}
        </button>
      </div>

      {/* Disclaimer */}
      <div
        className="p-4"
        style={{ background: 'rgba(124,117,104,0.06)', borderRadius: 'var(--radius)' }}
      >
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.6, opacity: 0.8 }}>
          {TEXTS.result.disclaimer}
        </p>
      </div>
    </div>
  )
}

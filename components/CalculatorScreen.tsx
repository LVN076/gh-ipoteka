'use client'

import { useState, useCallback } from 'react'
import { TEXTS, MORTGAGE_PROGRAMS, MORTGAGE_TERMS_YEARS, MortgageProgram } from '@/lib/config'
import { calculateMortgage, CalculatorResult, formatInputNumber, parseNumber, ymEvent } from '@/lib/mortgage'
import { SITE_CONFIG } from '@/lib/config'

interface CalculatorScreenProps {
  onResult: (result: CalculatorResult, input: {
    programName: string
    propertyPrice: number
    downPayment: number
    termYears: number
    rate: number
  }) => void
  userName?: string
}

export default function CalculatorScreen({ onResult, userName }: CalculatorScreenProps) {
  const [selectedProgram, setSelectedProgram] = useState<MortgageProgram | null>(null)
  const [propertyPrice, setPropertyPrice] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [termYears, setTermYears] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showProgramList, setShowProgramList] = useState(false)

  const downPaymentPct = useCallback(() => {
    const price = parseNumber(propertyPrice)
    const dp = parseNumber(downPayment)
    if (!price || !dp) return null
    return Math.round((dp / price) * 100 * 10) / 10
  }, [propertyPrice, downPayment])

  const minDownPayment = useCallback(() => {
    if (!selectedProgram) return null
    const price = parseNumber(propertyPrice)
    if (!price) return null
    return Math.round(price * selectedProgram.minDownPaymentPct / 100)
  }, [selectedProgram, propertyPrice])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const price = parseNumber(propertyPrice)
    const dp = parseNumber(downPayment)

    if (!selectedProgram) {
      newErrors.program = 'Выберите программу ипотеки'
    }
    if (!price || price <= 0) {
      newErrors.propertyPrice = 'Укажите стоимость недвижимости'
    }
    if (!dp && dp !== 0) {
      newErrors.downPayment = 'Укажите первоначальный взнос'
    } else if (selectedProgram && price > 0) {
      const minDp = Math.round(price * selectedProgram.minDownPaymentPct / 100)
      if (dp < minDp) {
        newErrors.downPayment = `Минимальный взнос по этой программе — ${minDp.toLocaleString('ru-RU')} ₽ (${selectedProgram.minDownPaymentPct}%)`
      } else if (dp >= price) {
        newErrors.downPayment = 'Первоначальный взнос не может быть равен или превышать стоимость объекта'
      }
    }
    if (!termYears) {
      newErrors.term = 'Выберите срок ипотеки'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculate = () => {
    if (!validate() || !selectedProgram || !termYears) return

    const price = parseNumber(propertyPrice)
    const dp = parseNumber(downPayment)

    const result = calculateMortgage({
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      rate: selectedProgram.rate,
      propertyPrice: price,
      downPayment: dp,
      termYears,
    })

    ymEvent(SITE_CONFIG.yandexMetrikaId, 'calculate_result')
    onResult(result, {
      programName: selectedProgram.name,
      propertyPrice: price,
      downPayment: dp,
      termYears,
      rate: selectedProgram.rate,
    })
  }

  const pct = downPaymentPct()
  const minDp = minDownPayment()

  return (
    <div className="screen-enter flex flex-col min-h-screen px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
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
        </div>
        {userName && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            👋 {userName}
          </span>
        )}
      </header>

      {/* Step */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-1.5">
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="w-6 h-0.5 rounded-full" style={{ background: 'var(--color-text)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>Шаг 2 из 2</span>
      </div>

      <h2
        className="mb-8 leading-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 7vw, 36px)', fontWeight: 400, color: 'var(--color-text)' }}
      >
        {TEXTS.calculator.title}
      </h2>

      <div className="flex flex-col gap-6">
        {/* Program selector */}
        <div>
          <label className="field-label">{TEXTS.calculator.programLabel}</label>
          <div className="relative">
            <button
              onClick={() => setShowProgramList(!showProgramList)}
              className={`input-field text-left flex items-center justify-between ${errors.program ? 'error' : ''}`}
              style={{ background: 'var(--color-surface)', cursor: 'pointer' }}
            >
              <span style={{ color: selectedProgram ? 'var(--color-text)' : 'rgba(124,117,104,0.7)' }}>
                {selectedProgram ? selectedProgram.name : TEXTS.calculator.programPlaceholder}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ transform: showProgramList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
              >
                <path d="M4 6L8 10L12 6" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showProgramList && (
              <div
                className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              >
                {MORTGAGE_PROGRAMS.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => {
                      setSelectedProgram(program)
                      setShowProgramList(false)
                      if (errors.program) setErrors(prev => ({ ...prev, program: '' }))
                    }}
                    className="w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors"
                    style={{
                      background: selectedProgram?.id === program.id ? 'var(--color-accent-light)' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => { if (selectedProgram?.id !== program.id) e.currentTarget.style.background = 'var(--color-bg)' }}
                    onMouseLeave={e => { if (selectedProgram?.id !== program.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 400, color: 'var(--color-text)' }}>
                        {program.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {program.badge && (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', padding: '2px 6px', background: 'rgba(196, 164, 74, 0.2)', color: '#a8873a', borderRadius: '2px' }}>
                            {program.badge}
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: '#a8873a' }}>
                          {program.rate}%
                        </span>
                      </div>
                    </div>
                    {program.hint && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {program.hint}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedProgram && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a8873a', marginTop: 6 }}>
              Ставка: {selectedProgram.rate}% · Взнос от {selectedProgram.minDownPaymentPct}%
            </p>
          )}
          {errors.program && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 6 }}>{errors.program}</p>
          )}
        </div>

        {/* Property price */}
        <div>
          <label className="field-label">{TEXTS.calculator.priceLabel}</label>
          <input
            type="text"
            className={`input-field ${errors.propertyPrice ? 'error' : ''}`}
            placeholder="5 000 000"
            value={propertyPrice}
            onChange={e => {
              setPropertyPrice(formatInputNumber(e.target.value))
              if (errors.propertyPrice) setErrors(prev => ({ ...prev, propertyPrice: '' }))
            }}
            inputMode="numeric"
          />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4, opacity: 0.7 }}>в рублях</p>
          {errors.propertyPrice && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 4 }}>{errors.propertyPrice}</p>
          )}
        </div>

        {/* Down payment */}
        <div>
          <label className="field-label">
            {TEXTS.calculator.downPaymentLabel}
            {pct !== null && (
              <span style={{ color: 'var(--color-gold)', marginLeft: 6 }}>— {pct}%</span>
            )}
          </label>
          <input
            type="text"
            className={`input-field ${errors.downPayment ? 'error' : ''}`}
            placeholder={minDp ? minDp.toLocaleString('ru-RU') : '1 000 000'}
            value={downPayment}
            onChange={e => {
              setDownPayment(formatInputNumber(e.target.value))
              if (errors.downPayment) setErrors(prev => ({ ...prev, downPayment: '' }))
            }}
            inputMode="numeric"
          />
          {minDp && !errors.downPayment && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4, opacity: 0.7 }}>
              Минимум по программе: {minDp.toLocaleString('ru-RU')} ₽
            </p>
          )}
          {errors.downPayment && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 4, lineHeight: 1.4 }}>{errors.downPayment}</p>
          )}
        </div>

        {/* Term */}
        <div>
          <label className="field-label">{TEXTS.calculator.termLabel}</label>
          <div className="flex gap-2 flex-wrap">
            {MORTGAGE_TERMS_YEARS.map(year => (
              <button
                key={year}
                onClick={() => {
                  setTermYears(year)
                  if (errors.term) setErrors(prev => ({ ...prev, term: '' }))
                }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 400,
                  padding: '10px 16px',
                  border: `1px solid ${termYears === year ? 'var(--color-text)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  background: termYears === year ? 'var(--color-text)' : 'transparent',
                  color: termYears === year ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minWidth: 60,
                  textAlign: 'center',
                }}
              >
                {year} лет
              </button>
            ))}
          </div>
          {errors.term && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 6 }}>{errors.term}</p>
          )}
        </div>
      </div>

      {/* Calculate button */}
      <button onClick={handleCalculate} className="btn-primary mt-10">
        {TEXTS.calculator.calculateButton}
        <svg className="ml-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

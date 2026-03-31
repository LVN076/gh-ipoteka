'use client'

import { useState } from 'react'
import { TEXTS } from '@/lib/config'
import { getUtmParams } from '@/lib/mortgage'
import { ymEvent } from '@/lib/mortgage'
import { SITE_CONFIG } from '@/lib/config'

interface LeadFormScreenProps {
  onSuccess: (name: string, phone: string) => void
  onBack: () => void
}

export default function LeadFormScreen({ onSuccess, onBack }: LeadFormScreenProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    let result = ''
    const d = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits

    if (d.length > 0) result = '+7 ('
    if (d.length >= 1) result += d.slice(0, 3)
    if (d.length >= 4) result += ') ' + d.slice(3, 6)
    if (d.length >= 7) result += '-' + d.slice(6, 8)
    if (d.length >= 9) result += '-' + d.slice(8, 10)

    return result
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Пожалуйста, введите ваше имя'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
    }

    const phoneDigits = phone.replace(/\D/g, '')
    if (!phone) {
      newErrors.phone = 'Пожалуйста, введите номер телефона'
    } else if (phoneDigits.length < 11) {
      newErrors.phone = 'Введите полный номер телефона'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    setApiError('')

    try {
      const utmParams = getUtmParams()

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          source: 'phone_lead',
          ...utmParams,
        }),
      })

      const result = await response.json()

      if (result.success) {
        ymEvent(SITE_CONFIG.yandexMetrikaId, 'submit_phone_form')
        onSuccess(name.trim(), phone)
      } else {
        setApiError('Ошибка отправки. Попробуйте ещё раз или позвоните нам.')
      }
    } catch {
      setApiError('Ошибка соединения. Проверьте интернет и попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-enter flex flex-col min-h-screen px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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

      {/* Step */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-1.5">
          <div className="w-6 h-0.5 rounded-full" style={{ background: 'var(--color-text)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>Шаг 1 из 2</span>
      </div>

      {/* Title */}
      <h2
        className="mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 8vw, 38px)', fontWeight: 400, color: 'var(--color-text)' }}
      >
        {TEXTS.leadForm.title}
      </h2>
      <p
        className="mb-10"
        style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, lineHeight: 1.6, color: 'var(--color-text-muted)' }}
      >
        {TEXTS.leadForm.desc}
      </p>

      {/* Form */}
      <div className="flex flex-col gap-5 flex-1">
        {/* Name */}
        <div>
          <label className="field-label">{TEXTS.leadForm.namePlaceholder.replace('Ваше ', '')}</label>
          <input
            type="text"
            className={`input-field ${errors.name ? 'error' : ''}`}
            placeholder={TEXTS.leadForm.namePlaceholder}
            value={name}
            onChange={e => {
              setName(e.target.value)
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
            }}
            autoComplete="given-name"
            autoCapitalize="words"
          />
          {errors.name && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 6 }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="field-label">Телефон</label>
          <input
            type="tel"
            className={`input-field ${errors.phone ? 'error' : ''}`}
            placeholder={TEXTS.leadForm.phonePlaceholder}
            value={phone}
            onChange={handlePhoneChange}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#d97373', marginTop: 6 }}>
              {errors.phone}
            </p>
          )}
        </div>

        {/* API error */}
        {apiError && (
          <div
            className="p-4"
            style={{ background: 'rgba(217, 115, 115, 0.08)', border: '1px solid rgba(217, 115, 115, 0.3)', borderRadius: 'var(--radius)' }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#c44a4a' }}>{apiError}</p>
          </div>
        )}

        <div className="flex-1" />

        {/* Submit */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <svg className="animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12"/>
                </svg>
                Отправляем...
              </>
            ) : (
              TEXTS.leadForm.submitButton
            )}
          </button>

          <p
            className="text-center"
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5, opacity: 0.7 }}
          >
            {TEXTS.leadForm.privacyText}
          </p>
        </div>
      </div>
    </div>
  )
}

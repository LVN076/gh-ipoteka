'use client'

import { useState, useEffect } from 'react'
import { TEXTS, SITE_CONFIG } from '@/lib/config'

interface VKScreenProps {
  onConfirm: () => void
  onBack: () => void
}

const WAIT_SECONDS = 8 // минимум секунд после открытия VK

export default function VKScreen({ onConfirm, onBack }: VKScreenProps) {
  const [vkOpened, setVkOpened] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS)
  const [canConfirm, setCanConfirm] = useState(false)

  useEffect(() => {
    if (!vkOpened) return
    if (secondsLeft <= 0) {
      setCanConfirm(true)
      return
    }
    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [vkOpened, secondsLeft])

  const handleOpenVK = () => {
    window.open(SITE_CONFIG.vkGroupUrl, '_blank', 'noopener,noreferrer')
    setVkOpened(true)
    setSecondsLeft(WAIT_SECONDS)
    setCanConfirm(false)
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
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Good House
        </div>
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

      <h2 className="mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 7vw, 32px)', fontWeight: 400, color: 'var(--color-text)' }}>
        {TEXTS.vkScreen.title}
      </h2>
      <p className="mb-8" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        {TEXTS.vkScreen.desc}
      </p>

      {/* VK Button */}
      {!vkOpened ? (
        <button onClick={handleOpenVK} className="btn-primary mb-4" style={{ background: 'linear-gradient(180deg, #5181b8 0%, #4a76a8 40%, #3d6491 100%)', borderColor: '#2d5278' }}>
          <svg className="mr-3" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.45h-1.64c-.62 0-.81-.49-1.93-1.6-1-.93-1.43-1.07-1.68-1.07-.34 0-.44.09-.44.57v1.46c0 .41-.13.65-1.18.65-1.74 0-3.65-1.05-5-3.01-2.03-2.85-2.59-4.98-2.59-5.42 0-.25.09-.48.57-.48h1.64c.43 0 .59.19.75.65.83 2.38 2.21 4.47 2.78 4.47.21 0 .31-.1.31-.63V9.18c-.06-1.15-.67-1.25-.67-1.66 0-.2.16-.4.42-.4h2.59c.36 0 .49.19.49.61v3.29c0 .36.16.49.27.49.21 0 .39-.13.78-.52 1.2-1.36 2.06-3.44 2.06-3.44.11-.25.32-.48.75-.48h1.64c.49 0 .6.25.49.61-.2.95-2.16 3.7-2.16 3.7-.17.27-.23.39 0 .69.17.23.71.71 1.07 1.14.66.75 1.17 1.37 1.3 1.8.15.43-.08.65-.51.65z"/>
          </svg>
          {TEXTS.vkScreen.openVkButton}
        </button>
      ) : (
        <>
          {/* Opened state: VK link again + countdown */}
          <button onClick={handleOpenVK} className="btn-secondary mb-4" style={{ fontSize: '13px', padding: '12px 16px' }}>
            <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.45h-1.64c-.62 0-.81-.49-1.93-1.6-1-.93-1.43-1.07-1.68-1.07-.34 0-.44.09-.44.57v1.46c0 .41-.13.65-1.18.65-1.74 0-3.65-1.05-5-3.01-2.03-2.85-2.59-4.98-2.59-5.42 0-.25.09-.48.57-.48h1.64c.43 0 .59.19.75.65.83 2.38 2.21 4.47 2.78 4.47.21 0 .31-.1.31-.63V9.18c-.06-1.15-.67-1.25-.67-1.66 0-.2.16-.4.42-.4h2.59c.36 0 .49.19.49.61v3.29c0 .36.16.49.27.49.21 0 .39-.13.78-.52 1.2-1.36 2.06-3.44 2.06-3.44.11-.25.32-.48.75-.48h1.64c.49 0 .6.25.49.61-.2.95-2.16 3.7-2.16 3.7-.17.27-.23.39 0 .69.17.23.71.71 1.07 1.14.66.75 1.17 1.37 1.3 1.8.15.43-.08.65-.51.65z"/>
            </svg>
            Открыть ВКонтакте снова
          </button>

          {/* Countdown / Confirm */}
          {!canConfirm ? (
            <div className="text-center py-4">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                Ждём подтверждения подписки…
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #f5f4f0 0%, #e0dfd9 100%)',
                border: '2px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--color-text)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}>
                {secondsLeft}
              </div>
            </div>
          ) : (
            <button onClick={onConfirm} className="btn-primary">
              ✓ {TEXTS.vkScreen.confirmButton}
            </button>
          )}
        </>
      )}

      {/* Info note */}
      <p className="mt-auto pt-8" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, opacity: 0.8 }}>
        Автоматическая проверка подписки требует доступа к вашему аккаунту ВКонтакте — мы этого не делаем из соображений приватности. Пожалуйста, подпишитесь и нажмите кнопку подтверждения.
      </p>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'

const VK_APP_ID = 54522246
const VK_GROUP_OWNER_ID = -143228474 // goodhouse_yar

interface VKScreenProps {
  onConfirm: () => void
  onBack: () => void
}

declare global {
  interface Window {
    VK?: {
      init: (params: { apiId: number; onlyWidgets?: boolean }) => void
      Widgets?: {
        Subscribe: (elementId: string, params: { mode: number; soft: number }, ownerId?: number) => void
      }
      Observer?: {
        subscribe: (event: string, fn: () => void) => void
      }
    }
  }
}

export default function VKScreen({ onConfirm, onBack }: VKScreenProps) {
  const [status, setStatus] = useState<'idle' | 'not_member' | 'error' | 'success'>('idle')
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const vkOk  = params.get('vk_ok')
    const vkErr = params.get('vk_err')

    if (vkOk === '1') {
      window.history.replaceState({}, '', '/')
      onConfirm()
      return
    }
    if (vkErr === 'not_member') {
      window.history.replaceState({}, '', '/')
      setStatus('not_member')
      return
    }
    if (vkErr) {
      window.history.replaceState({}, '', '/')
      setStatus('error')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://vk.com/js/api/openapi.js?169'
    script.async = true
    script.onload = () => {
      if (window.VK) {
        window.VK.init({ apiId: VK_APP_ID, onlyWidgets: true })
        setTimeout(() => {
          if (window.VK?.Widgets?.Subscribe) {
            window.VK.Widgets.Subscribe('vk_subscribe', { mode: 1, soft: 0 }, VK_GROUP_OWNER_ID)
            setWidgetLoaded(true)
          }
        }, 300)
      }
    }
    script.onerror = () => setStatus('error')
    document.head.appendChild(script)

    return () => {
      const s = document.querySelector('script[src*="openapi.js"]')
      if (s) s.remove()
    }
  }, [onConfirm])

  /**
   * VK ID OAuth 2.0 (id.vk.com) — приложение зарегистрировано именно там.
   * scope НЕ запрашиваем — нам нужен только user_id.
   * Проверку членства делаем на сервере через сервисный токен.
   */
  const handleVKLogin = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/vk-callback`)
    window.location.href =
      `https://id.vk.com/authorize` +
      `?response_type=code` +
      `&client_id=${VK_APP_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&state=vk_sub_check`
    // scope намеренно не передаём — VK ID выдаёт user_id без лишних прав
  }

  return (
    <div className="screen-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px 24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)' }}>
          ← Назад
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
          ГУД ХАУС
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '40px' }}>
        <div style={{ height: '2px', flex: 1, background: 'var(--color-text)' }}></div>
        <div style={{ height: '2px', flex: 1, background: 'var(--color-border)' }}></div>
      </div>

      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, lineHeight: 1.2, marginBottom: '16px', color: 'var(--color-text)' }}>
          Подпишитесь на нашу группу
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px', fontFamily: 'var(--font-body)' }}>
          После подписки вы получите доступ к калькулятору и будете первыми узнавать о новых проектах и акциях
        </p>

        {status === 'success' && (
          <div style={{ background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '15px', color: '#0f5132', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>
              ✓ Подписка подтверждена! Открываем калькулятор...
            </p>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div id="vk_subscribe" style={{ minHeight: '50px' }}></div>
          {!widgetLoaded && status !== 'error' && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
              Загрузка виджета ВКонтакте...
            </div>
          )}
        </div>

        {widgetLoaded && status !== 'success' && (
          <button onClick={handleVKLogin} style={{ width: '100%', padding: '14px 24px', background: 'var(--color-text)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', marginTop: '16px' }}>
            Я подписался — подтвердить через ВКонтакте →
          </button>
        )}

        {status === 'not_member' && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px', marginTop: '12px' }}>
            <p style={{ fontSize: '14px', color: '#856404', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              ❌ Подписка не обнаружена. Нажмите «Вступить» в виджете выше и попробуйте снова.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px', marginTop: '12px' }}>
            <p style={{ fontSize: '14px', color: '#842029', fontFamily: 'var(--font-body)', margin: 0 }}>
              Не удалось проверить подписку.{' '}
              <a href="https://vk.com/goodhouse_yar" target="_blank" rel="noopener noreferrer" style={{ color: '#4a76a8' }}>Открыть группу →</a>
            </p>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5, marginTop: '16px' }}>
          Нажмите «Вступить» в виджете, затем нажмите кнопку подтверждения.
        </p>
      </div>
    </div>
  )
}

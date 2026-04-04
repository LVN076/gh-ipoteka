'use client'
import { useEffect, useState, useRef } from 'react'

/**
 * VK App ID и числовой ID группы (без минуса).
 * VK_APP_ID нужен для OAuth-авторизации, чтобы получить реальный user_id.
 * VK_GROUP_OWNER_ID используется только для виджета подписки.
 */
const VK_APP_ID = 54522246
const VK_GROUP_OWNER_ID = -143228474 // goodhouse_yar
const VK_OAUTH_SCOPE = 'groups'       // минимальный scope для проверки членства

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

/** Получить vk_user_id из localStorage (сохраняется после OAuth) */
function getStoredVkUserId(): string | null {
  try { return localStorage.getItem('vk_user_id') } catch { return null }
}
function storeVkUserId(id: string) {
  try { localStorage.setItem('vk_user_id', id) } catch { /* ignore */ }
}

export default function VKScreen({ onConfirm, onBack }: VKScreenProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'not_member' | 'error' | 'success'>('idle')
  const [widgetLoaded, setWidgetLoaded] = useState(false)
  const [vkUserId, setVkUserId] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const oauthWindowRef = useRef<Window | null>(null)

  // При монтировании — восстановить userId из localStorage и проверить URL-параметры
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Восстановить userId
    const stored = getStoredVkUserId()
    if (stored) {
      setVkUserId(stored)
      setIsAuthorized(true)
    }

    // Обработать редирект после OAuth (vk-callback)
    const params = new URLSearchParams(window.location.search)
    const vkOk = params.get('vk_ok')
    const vkErr = params.get('vk_err')
    const newUserId = params.get('vk_user_id')

    if (newUserId) {
      storeVkUserId(newUserId)
      setVkUserId(newUserId)
      setIsAuthorized(true)
    }

    if (vkOk === '1') {
      window.history.replaceState({}, '', '/')
      // Если userId уже есть — сразу проверяем
      const uid = newUserId || stored
      if (uid) {
        checkSubscription(uid)
      }
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

    // Загрузить VK JS SDK для виджета подписки
    const script = document.createElement('script')
    script.src = 'https://vk.com/js/api/openapi.js?169'
    script.async = true
    script.onload = () => {
      if (window.VK) {
        window.VK.init({ apiId: VK_APP_ID, onlyWidgets: true })
        if (window.VK.Observer) {
          window.VK.Observer.subscribe('widgets.subscribed', () => {
            // Виджет зафиксировал подписку — но мы всё равно проверим на сервере
            const uid = getStoredVkUserId()
            if (uid) {
              checkSubscription(uid)
            }
          })
        }
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

    // Слушаем сообщения от popup-окна OAuth
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === 'vk_auth_success' && event.data?.userId) {
        const uid = String(event.data.userId)
        storeVkUserId(uid)
        setVkUserId(uid)
        setIsAuthorized(true)
        oauthWindowRef.current?.close()
      }
    }
    window.addEventListener('message', handleMessage)

    return () => {
      const s = document.querySelector('script[src*="openapi.js"]')
      if (s) s.remove()
      window.removeEventListener('message', handleMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Открыть VK OAuth в popup для получения user_id */
  const handleVKLogin = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/vk-callback`)
    const oauthUrl =
      `https://oauth.vk.com/authorize?client_id=${VK_APP_ID}` +
      `&redirect_uri=${redirectUri}&scope=${VK_OAUTH_SCOPE}&response_type=token&v=5.131`

    const popup = window.open(oauthUrl, 'vk_oauth', 'width=650,height=500,top=100,left=300')
    oauthWindowRef.current = popup

    // Fallback: если popup заблокирован — открываем в новой вкладке
    if (!popup) {
      window.location.href = oauthUrl
    }
  }

  /** Серверная проверка подписки */
  const checkSubscription = async (userId: string) => {
    setStatus('checking')
    try {
      const res = await fetch('/api/check-vk-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[VKScreen] check-vk-subscription error:', data)
        setStatus('error')
        return
      }

      const data = await res.json()

      if (data.isMember === true) {
        setStatus('success')
        setTimeout(() => onConfirm(), 1200)
      } else {
        setStatus('not_member')
      }
    } catch (err) {
      console.error('[VKScreen] fetch error:', err)
      setStatus('error')
    }
  }

  /** Обработчик кнопки "Я подписался" */
  const handleManualCheck = async () => {
    if (!vkUserId) {
      // Нет userId — сначала нужна авторизация VK
      handleVKLogin()
      return
    }
    await checkSubscription(vkUserId)
  }

  return (
    <div className="screen-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px 24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)' }}
        >
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

        {/* Успех */}
        {status === 'success' && (
          <div style={{ background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '24px' }}>
            <p style={{ fontSize: '15px', color: '#0f5132', fontFamily: 'var(--font-body)', margin: 0, fontWeight: 600 }}>
              ✓ Подписка подтверждена! Открываем калькулятор...
            </p>
          </div>
        )}

        {/* VK Subscribe Widget */}
        <div style={{ marginBottom: '24px' }}>
          <div id="vk_subscribe" style={{ minHeight: '50px' }}></div>
          {!widgetLoaded && status !== 'error' && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontFamily: 'var(--font-body)', marginTop: '8px' }}>
              Загрузка виджета ВКонтакте...
            </div>
          )}
        </div>

        {/* Индикатор авторизации VK */}
        {isAuthorized && vkUserId && status !== 'success' && (
          <div style={{ background: '#e8f0fe', border: '1px solid #c2d4fc', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#1a3a6e', fontFamily: 'var(--font-body)', margin: 0 }}>
              ✓ Аккаунт ВКонтакте подключён. ID: {vkUserId}
            </p>
          </div>
        )}

        {/* Кнопка "Я подписался" — видна только когда виджет загружен и нет успеха */}
        {widgetLoaded && status !== 'success' && (
          <button
            onClick={handleManualCheck}
            disabled={status === 'checking'}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: status === 'checking' ? 'var(--color-border)' : 'var(--color-text)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: status === 'checking' ? 'not-allowed' : 'pointer',
              marginTop: '16px',
              transition: 'background 0.2s',
            }}
          >
            {status === 'checking'
              ? 'Проверяем подписку...'
              : !isAuthorized
                ? 'Войти через ВКонтакте и проверить'
                : 'Я подписался — открыть калькулятор →'}
          </button>
        )}

        {/* Не подписан */}
        {status === 'not_member' && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px', marginTop: '12px' }}>
            <p style={{ fontSize: '14px', color: '#856404', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              ❌ Подписка не обнаружена. Пожалуйста, нажмите «Вступить» в виджете выше, а затем нажмите кнопку снова.
            </p>
          </div>
        )}

        {/* Ошибка */}
        {status === 'error' && (
          <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px', marginTop: '12px' }}>
            <p style={{ fontSize: '14px', color: '#842029', fontFamily: 'var(--font-body)', margin: 0 }}>
              Не удалось проверить подписку.{' '}
              <a href="https://vk.com/goodhouse_yar" target="_blank" rel="noopener noreferrer" style={{ color: '#4a76a8' }}>
                Открыть группу ВКонтакте →
              </a>
            </p>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5, marginTop: '16px' }}>
          {isAuthorized
            ? 'Нажмите «Вступить» в виджете, затем — «Я подписался».'
            : 'Нажмите кнопку ниже, войдите в ВКонтакте и подтвердите подписку.'}
        </p>
      </div>
    </div>
  )
}

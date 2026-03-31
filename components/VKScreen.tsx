'use client'
import { useEffect, useState } from 'react'

const VK_CLIENT_ID = '54518519'
const REDIRECT_URI = 'https://gh-ipoteka.vercel.app/api/vk-callback'
const VK_GROUP_URL = 'https://vk.com/goodhouse_yar'

interface VKScreenProps {
  onConfirm: () => void
  onBack: () => void
}

export default function VKScreen({ onConfirm, onBack }: VKScreenProps) {
  const [status, setStatus] = useState<'idle' | 'not_member' | 'error'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const vkOk = params.get('vk_ok')
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
  }, [onConfirm])

  const handleVKAuth = () => {
    // VK ID OAuth 2.1 endpoint (для приложений созданных через id.vk.com)
    const params = new URLSearchParams({
      client_id: VK_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'groups',
      state: Math.random().toString(36).substring(2),
    })
    window.location.href = `https://oauth.vk.com/authorize?${params.toString()}`
  }

  return (
    <div className="screen-enter" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '20px 24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)' }}>
          ← Назад
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

        <button
          onClick={handleVKAuth}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(to bottom, #5181b8, #4a76a8)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: '17px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(81,129,184,0.4)',
            marginBottom: '16px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.07.587-1.006c-.043-.075-.308-.656-1.588-1.858-1.34-1.256-1.16-1.053.453-3.226.983-1.32 1.376-2.125 1.253-2.47-.117-.33-.84-.243-.84-.243l-2.406.015s-.179-.025-.311.06c-.13.082-.213.273-.213.273s-.382 1.028-.89 1.902c-1.073 1.847-1.503 1.946-1.678 1.83-.408-.267-.306-1.068-.306-1.637 0-1.78.266-2.52-.521-2.712-.261-.064-.453-.106-1.12-.113-.856-.009-1.58.003-1.99.206-.273.134-.484.433-.356.45.159.02.519.099.71.363.246.344.237 1.117.237 1.117s.142 2.097-.33 2.357c-.324.176-.769-.183-1.724-1.823-.49-.855-.86-1.8-.86-1.8s-.07-.186-.198-.286c-.154-.12-.37-.158-.37-.158l-2.286.015s-.343.01-.469.161c-.112.134-.009.41-.009.41s1.788 4.248 3.814 6.39c1.858 1.967 3.97 1.838 3.97 1.838h.957z"/>
          </svg>
          Войти через VK и подписаться
        </button>

        {status === 'not_member' && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#856404', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Вы авторизованы, но ещё не подписаны на группу.{' '}
              <a href={VK_GROUP_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#4a76a8', fontWeight: 600 }}>
                Подпишитесь на группу
              </a>{' '}
              и попробуйте снова.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#842029', fontFamily: 'var(--font-body)', margin: 0 }}>
              Что-то пошло не так. Попробуйте ещё раз.
            </p>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5, marginTop: '8px' }}>
          Мы запросим разрешение на проверку ваших групп. Личные данные не передаются третьим лицам.
        </p>
      </div>
    </div>
  )
}

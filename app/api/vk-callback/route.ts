import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/vk-callback
 *
 * VK ID OAuth 2.0 Authorization Code Flow.
 * Обменивает code на access_token, получает user_id,
 * затем через groups.isMember проверяет реальную подписку на группу.
 *
 * Необходимые переменные окружения (серверные):
 *   VK_CLIENT_ID      — ID VK-приложения
 *   VK_CLIENT_SECRET  — секретный ключ VK-приложения
 *   VK_SERVICE_TOKEN  — сервисный ключ (для groups.isMember)
 *   VK_GROUP_ID       — числовой ID группы или slug (например goodhouse_yar)
 *   VK_REDIRECT_URI   — callback URL (https://your-domain.com/api/vk-callback)
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const clientId     = process.env.VK_CLIENT_ID
  const clientSecret = process.env.VK_CLIENT_SECRET
  const serviceToken = process.env.VK_SERVICE_TOKEN
  const groupId      = process.env.VK_GROUP_ID || 'goodhouse_yar'
  const redirectUri  = process.env.VK_REDIRECT_URI ||
                       'https://gh-ipoteka.vercel.app/api/vk-callback'

  if (!clientId || !clientSecret || !serviceToken) {
    console.error('[vk-callback] Missing env vars: VK_CLIENT_ID / VK_CLIENT_SECRET / VK_SERVICE_TOKEN')
    return NextResponse.redirect(new URL('/?vk_err=server_config', request.url))
  }

  if (error) {
    return NextResponse.redirect(new URL('/?vk_err=denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?vk_err=no_code', request.url))
  }

  try {
    // Шаг 1: обменять code на access_token
    const tokenRes = await fetch('https://id.vk.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
        client_id:     clientId,
        client_secret: clientSecret,
      }).toString(),
    })

    const tokenData = await tokenRes.json()
    console.log('[vk-callback] token response:', JSON.stringify(tokenData))

    if (tokenData.error || !tokenData.access_token) {
      console.error('[vk-callback] token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // Шаг 2: получить user_id
    let userId: string | number | null = tokenData.user_id || null

    if (!userId) {
      const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
        body: new URLSearchParams({ client_id: clientId }).toString(),
      })
      const userData = await userRes.json()
      userId = userData.user?.id || userData.sub || null
      console.log('[vk-callback] userinfo:', JSON.stringify(userData))
    }

    if (!userId) {
      console.error('[vk-callback] Could not get user_id')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Шаг 3: серверная проверка членства в группе
    const memberRes = await fetch(
      `https://api.vk.com/method/groups.isMember?group_id=${groupId}&user_id=${userId}&access_token=${serviceToken}&v=5.131`
    )
    const memberData = await memberRes.json()
    console.log('[vk-callback] isMember:', JSON.stringify(memberData))

    if (memberData.error) {
      console.error('[vk-callback] groups.isMember error:', memberData.error)
      return NextResponse.redirect(new URL('/?vk_err=vk_api_error', request.url))
    }

    const isMember = memberData.response === 1

    if (isMember) {
      // Передаём user_id в URL, чтобы VKScreen мог сохранить его
      return NextResponse.redirect(new URL(`/?vk_ok=1&vk_user_id=${userId}`, request.url))
    } else {
      return NextResponse.redirect(new URL('/?vk_err=not_member', request.url))
    }
  } catch (err) {
    console.error('[vk-callback] Unexpected error:', err)
    return NextResponse.redirect(new URL('/?vk_err=server_error', request.url))
  }
}

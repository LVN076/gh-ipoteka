import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/vk-callback
 *
 * VK ID OAuth 2.0 Authorization Code Flow.
 * Приложение зарегистрировано на id.vk.com, поэтому:
 * - авторизация: id.vk.com/authorize
 * - обмен токена: id.vk.com/oauth2/token
 * - user_id получаем из id.vk.com/oauth2/user_info
 *
 * Проверка членства в группе — через сервисный токен (VK_SERVICE_TOKEN),
 * никакие пользовательские scope не нужны.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  const clientId     = process.env.VK_CLIENT_ID
  const clientSecret = process.env.VK_CLIENT_SECRET
  const serviceToken = process.env.VK_SERVICE_TOKEN
  const groupId      = process.env.VK_GROUP_ID || 'goodhouse_yar'
  const redirectUri  = process.env.VK_REDIRECT_URI ||
                       'https://gh-ipoteka.vercel.app/api/vk-callback'

  if (!clientId || !clientSecret || !serviceToken) {
    console.error('[vk-callback] Missing env vars')
    return NextResponse.redirect(new URL('/?vk_err=server_config', request.url))
  }

  if (error) {
    console.log('[vk-callback] User denied:', error)
    return NextResponse.redirect(new URL('/?vk_err=denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?vk_err=no_code', request.url))
  }

  try {
    // Шаг 1: обменять code на access_token через VK ID
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

    // Шаг 2: получить user_id из VK ID userinfo endpoint
    let userId = tokenData.user_id

    if (!userId) {
      const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id:    clientId,
          access_token: tokenData.access_token,
        }).toString(),
      })
      const userData = await userRes.json()
      console.log('[vk-callback] userinfo:', JSON.stringify(userData))
      userId = userData.user?.id || userData.id || null
    }

    if (!userId) {
      console.error('[vk-callback] Could not get user_id')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Шаг 3: серверная проверка членства через VK API (сервисный токен)
    const memberRes = await fetch(
      `https://api.vk.com/method/groups.isMember` +
      `?group_id=${groupId}&user_id=${userId}` +
      `&access_token=${serviceToken}&v=5.131`
    )
    const memberData = await memberRes.json()
    console.log('[vk-callback] isMember:', JSON.stringify(memberData))

    if (memberData.error) {
      console.error('[vk-callback] groups.isMember error:', memberData.error)
      return NextResponse.redirect(new URL('/?vk_err=vk_api_error', request.url))
    }

    const isMember = memberData.response === 1

    if (isMember) {
      return NextResponse.redirect(new URL('/?vk_ok=1', request.url))
    } else {
      return NextResponse.redirect(new URL('/?vk_err=not_member', request.url))
    }
  } catch (err) {
    console.error('[vk-callback] Unexpected error:', err)
    return NextResponse.redirect(new URL('/?vk_err=server_error', request.url))
  }
}

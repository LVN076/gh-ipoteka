import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/vk-callback
 *
 * VK ID OAuth 2.0 Authorization Code Flow с PKCE (RFC 7636).
 * Приложение зарегистрировано на id.vk.com (VK ID, не VK OAuth).
 *
 * VK ID возвращает code типа "vk2.a.*" с параметром device_id.
 * Эндпоинт обмена токена: https://id.vk.com/oauth2/auth (НЕ /oauth2/token)
 * device_id обязателен при обмене.
 *
 * code_verifier передаётся через cookie "pkce_verifier".
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code      = searchParams.get('code')
  const error     = searchParams.get('error')
  const deviceId  = searchParams.get('device_id') || ''

  const clientId     = process.env.VK_CLIENT_ID
  const clientSecret = process.env.VK_CLIENT_SECRET
  const serviceToken = process.env.VK_SERVICE_TOKEN
  const groupId      = process.env.VK_GROUP_ID || 'goodhouse_yar'
  const redirectUri  = process.env.VK_REDIRECT_URI || 'https://gh-ipoteka.vercel.app/api/vk-callback'

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

  // Читаем code_verifier из cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const pkceMatch = cookieHeader.match(/pkce_verifier=([^;\s]+)/)
  const codeVerifier = pkceMatch ? decodeURIComponent(pkceMatch[1]) : null

  console.log('[vk-callback] cookie len:', cookieHeader.length, 'verifier found:', !!codeVerifier, 'device_id:', deviceId)

  if (!codeVerifier) {
    console.error('[vk-callback] No pkce_verifier cookie')
    return NextResponse.redirect(new URL('/?vk_err=no_verifier', request.url))
  }

  try {
    // Шаг 1: обменять code на access_token через VK ID
    // VK ID использует /oauth2/auth endpoint с grant_type=authorization_code
    const tokenBody = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
      device_id:     deviceId,
    })

    console.log('[vk-callback] Token exchange, code prefix:', code.slice(0, 10), 'verifier len:', codeVerifier.length)

    // VK ID использует /oauth2/auth для code_v2
    const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    tokenBody.toString(),
    })

    const tokenText = await tokenRes.text()
    console.log('[vk-callback] token raw response (first 200):', tokenText.slice(0, 200))

    let tokenData: Record<string, unknown>
    try {
      tokenData = JSON.parse(tokenText)
    } catch {
      console.error('[vk-callback] Token response is not JSON:', tokenText.slice(0, 300))
      return NextResponse.redirect(new URL('/?vk_err=token_not_json', request.url))
    }

    console.log('[vk-callback] token parsed:', JSON.stringify(tokenData).slice(0, 200))

    if (tokenData.error || !tokenData.access_token) {
      console.error('[vk-callback] token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // Шаг 2: получить user_id
    let userId = tokenData.user_id as string | number | null
    if (!userId) {
      const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          client_id:    clientId,
          access_token: tokenData.access_token as string,
        }).toString(),
      })
      const userData = await userRes.json()
      console.log('[vk-callback] userinfo:', JSON.stringify(userData).slice(0, 200))
      userId = (userData.user?.id || userData.id || null) as string | number | null
    }

    if (!userId) {
      console.error('[vk-callback] Could not get user_id')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Шаг 3: серверная проверка членства через VK API (сервисный токен)
    const memberRes = await fetch(
      'https://api.vk.com/method/groups.isMember' +
      '?group_id=' + groupId +
      '&user_id=' + userId +
      '&access_token=' + serviceToken +
      '&v=5.131'
    )
    const memberData = await memberRes.json()
    console.log('[vk-callback] isMember:', JSON.stringify(memberData))

    if (memberData.error) {
      console.error('[vk-callback] groups.isMember error:', memberData.error)
      return NextResponse.redirect(new URL('/?vk_err=vk_api_error', request.url))
    }

    const isMember = memberData.response === 1
    return NextResponse.redirect(new URL(isMember ? '/?vk_ok=1' : '/?vk_err=not_member', request.url))

  } catch (err) {
    console.error('[vk-callback] Unexpected error:', err)
    return NextResponse.redirect(new URL('/?vk_err=server_error', request.url))
  }
}

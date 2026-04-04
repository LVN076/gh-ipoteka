import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/vk-callback
 *
 * Стандартный VK OAuth 2.0 Authorization Code Flow (oauth.vk.com).
 * Обменивает code на access_token, получает user_id,
 * затем через groups.isMember проверяет реальную подписку на группу.
 *
 * Переменные окружения (серверные):
 *   VK_CLIENT_ID      — ID VK-приложения
 *   VK_CLIENT_SECRET  — защищённый ключ VK-приложения
 *   VK_SERVICE_TOKEN  — сервисный ключ (для groups.isMember)
 *   VK_GROUP_ID       — ID или slug группы (например goodhouse_yar)
 *   VK_REDIRECT_URI   — должен совпадать с настройками в VK-приложении
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
    // Шаг 1: обменять code на access_token через стандартный oauth.vk.com
    const tokenUrl = new URL('https://oauth.vk.com/access_token')
    tokenUrl.searchParams.set('client_id', clientId)
    tokenUrl.searchParams.set('client_secret', clientSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const tokenRes  = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()

    console.log('[vk-callback] token response:', JSON.stringify(tokenData))

    if (tokenData.error || !tokenData.access_token) {
      console.error('[vk-callback] token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // oauth.vk.com сразу возвращает user_id в ответе
    const userId = tokenData.user_id

    if (!userId) {
      console.error('[vk-callback] No user_id in token response')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Шаг 2: серверная проверка членства в группе через VK API
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

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/vk-callback
 *
 * VK ID OAuth 2.0 PKCE Authorization Code Flow.
 * App 54522246 registered on id.vk.com (VK ID Web type).
 * Token exchange endpoint: https://id.vk.com/oauth2/auth
 * code_verifier read from cookie (set by VKScreen.tsx before redirect).
 * No client_secret needed for PKCE flow.
 * groups.isMember called with service token - no scope=groups required from user.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code      = searchParams.get('code')
  const error     = searchParams.get('error')
  const deviceId  = searchParams.get('device_id')

  const clientId     = process.env.VK_CLIENT_ID
  const serviceToken = process.env.VK_SERVICE_TOKEN
  const groupId      = process.env.VK_GROUP_ID || 'goodhouse_yar'
  const redirectUri  = process.env.VK_REDIRECT_URI || 'https://gh-ipoteka.vercel.app/api/vk-callback'

  if (!clientId || !serviceToken) {
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

  // Read code_verifier from cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const codeVerifierMatch = cookieHeader.match(/(?:^|;\s*)vk_cv=([^;]+)/)
  const codeVerifier = codeVerifierMatch ? decodeURIComponent(codeVerifierMatch[1]) : null

  if (!codeVerifier) {
    console.error('[vk-callback] No code_verifier in cookie')
    return NextResponse.redirect(new URL('/?vk_err=no_verifier', request.url))
  }

  try {
    // Step 1: Exchange code for access_token via VK ID PKCE
    const tokenBody = new URLSearchParams({
      grant_type:    'authorization_code',
      code:          code,
      code_verifier: codeVerifier,
      client_id:     clientId,
      redirect_uri:  redirectUri,
      ...(deviceId ? { device_id: deviceId } : {}),
    })

    console.log('[vk-callback] Exchanging code (PKCE), code prefix:', code.slice(0, 10))
    const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
    })

    const tokenText = await tokenRes.text()
    console.log('[vk-callback] token raw (first 300):', tokenText.slice(0, 300))

    let tokenData: Record<string, unknown>
    try {
      tokenData = JSON.parse(tokenText)
    } catch {
      console.error('[vk-callback] Token response not JSON:', tokenText.slice(0, 300))
      return NextResponse.redirect(new URL('/?vk_err=token_not_json', request.url))
    }

    if (tokenData.error || !tokenData.access_token) {
      console.error('[vk-callback] token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // Step 2: Get user_id
    // VK ID token response includes user_id directly
    let userId = tokenData.user_id as string | number | null

    if (!userId) {
      // Fallback: call id.vk.com/oauth2/user_info
      try {
        const userInfoRes = await fetch('https://id.vk.com/oauth2/user_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + tokenData.access_token,
          },
          body: 'client_id=' + clientId,
        })
        const userInfoData = await userInfoRes.json()
        console.log('[vk-callback] user_info:', JSON.stringify(userInfoData).slice(0, 200))
        userId = userInfoData?.user?.user_id || userInfoData?.user_id
      } catch (e) {
        console.error('[vk-callback] user_info error:', e)
      }
    }

    if (!userId) {
      console.error('[vk-callback] No user_id obtained')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Step 3: Server-side membership check via service token (no scope=groups needed)
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

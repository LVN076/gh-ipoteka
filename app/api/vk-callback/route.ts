import { NextRequest, NextResponse } from 'next/server'

/**
   * GET /api/vk-callback
   *
   * Standard VK OAuth 2.0 Authorization Code Flow.
   * App 54525204 registered on dev.vk.com (standard VK OAuth, not VK ID).
   * Token exchange endpoint: https://oauth.vk.com/access_token
   * No PKCE, no device_id required.
   */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code       = searchParams.get('code')
    const error      = searchParams.get('error')

  const clientId      = process.env.VK_CLIENT_ID
    const clientSecret  = process.env.VK_CLIENT_SECRET
    const serviceToken  = process.env.VK_SERVICE_TOKEN
    const groupId       = process.env.VK_GROUP_ID || 'goodhouse_yar'
    const redirectUri   = process.env.VK_REDIRECT_URI || 'https://gh-ipoteka.vercel.app/api/vk-callback'

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
        // Step 1: Exchange code for access_token via standard VK OAuth
      const tokenUrl =
              'https://oauth.vk.com/access_token' +
              '?client_id=' + clientId +
              '&client_secret=' + clientSecret +
              '&redirect_uri=' + encodeURIComponent(redirectUri) +
              '&code=' + code

      console.log('[vk-callback] Exchanging code for token, code prefix:', code.slice(0, 10))

      const tokenRes = await fetch(tokenUrl)
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

      // Step 2: Get user_id from token response (VK includes it directly)
      const userId = tokenData.user_id as string | number | null

      if (!userId) {
              console.error('[vk-callback] No user_id in token response')
              return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
      }

      // Step 3: Server-side membership check via VK API (service token)
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

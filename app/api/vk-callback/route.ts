import { NextRequest, NextResponse } from 'next/server'

// VK ID app (id.vk.com) - Калькулятор Ипотеки
const VK_CLIENT_ID = '54522246'
const VK_CLIENT_SECRET = 'YZU7RwrciTSdREER2iGg'
const VK_SERVICE_TOKEN = '70436a4770436a4770436a478f737c9bc17704370436a47198dfa42650974d60bfadcca'
const VK_GROUP_ID = process.env.VK_GROUP_ID || 'goodhouse_yar'
const REDIRECT_URI = 'https://gh-ipoteka.vercel.app/api/vk-callback'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?vk_err=denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?vk_err=no_code', request.url))
  }

  try {
    // VK ID OAuth 2.0 - exchange code for token
    const tokenRes = await fetch('https://id.vk.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: VK_CLIENT_ID,
        client_secret: VK_CLIENT_SECRET,
      }).toString(),
    })

    const tokenData = await tokenRes.json()
    console.log('VK ID token response:', JSON.stringify(tokenData))

    if (tokenData.error || !tokenData.access_token) {
      console.error('VK token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // Get user_id from token response
    let userId = tokenData.user_id
    if (!userId) {
      // Try to get from userinfo endpoint
      const userRes = await fetch('https://id.vk.com/oauth2/user_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${tokenData.access_token}`
        },
        body: new URLSearchParams({ client_id: VK_CLIENT_ID }).toString(),
      })
      const userData = await userRes.json()
      userId = userData.user?.id || userData.sub
      console.log('userinfo response:', JSON.stringify(userData))
    }

    if (!userId) {
      console.error('Could not get user_id')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Check group membership via service token
    const memberRes = await fetch(
      `https://api.vk.com/method/groups.isMember?group_id=${VK_GROUP_ID}&user_id=${userId}&access_token=${VK_SERVICE_TOKEN}&v=5.199`
    )
    const memberData = await memberRes.json()
    console.log('isMember response:', JSON.stringify(memberData))

    const isMember = memberData.response === 1

    if (isMember) {
      return NextResponse.redirect(new URL('/?vk_ok=1', request.url))
    } else {
      return NextResponse.redirect(new URL('/?vk_err=not_member', request.url))
    }
  } catch (err) {
    console.error('VK callback error:', err)
    return NextResponse.redirect(new URL('/?vk_err=server_error', request.url))
  }
}

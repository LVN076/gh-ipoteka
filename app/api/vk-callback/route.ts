import { NextRequest, NextResponse } from 'next/server'

const VK_CLIENT_ID = process.env.VK_CLIENT_ID!
const VK_CLIENT_SECRET = process.env.VK_CLIENT_SECRET!
const VK_SERVICE_TOKEN = process.env.VK_SERVICE_TOKEN!
const VK_GROUP_ID = process.env.VK_GROUP_ID!
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
    console.log('VK token response:', JSON.stringify(tokenData))

    if (tokenData.error || !tokenData.access_token) {
      console.error('VK token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    // Получить user_id из токена или через VK API
    // VK ID возвращает id_token (JWT) или user_id в ответе
    let userId = tokenData.user_id

    if (!userId && tokenData.access_token) {
      // Получить user_id через users.get
      const userRes = await fetch(
        `https://api.vk.com/method/users.get?access_token=${tokenData.access_token}&v=5.199`
      )
      const userData = await userRes.json()
      userId = userData.response?.[0]?.id
    }

    if (!userId) {
      console.error('Could not get user_id')
      return NextResponse.redirect(new URL('/?vk_err=no_user_id', request.url))
    }

    // Проверить членство в группе через service token
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

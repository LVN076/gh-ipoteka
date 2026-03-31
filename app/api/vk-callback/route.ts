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

  // VK вернул ошибку (пользователь отказал)
  if (error) {
    return NextResponse.redirect(new URL('/?vk_err=denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?vk_err=no_code', request.url))
  }

  try {
    // Шаг 1: обменять code на access_token
    const tokenRes = await fetch(
      `https://oauth.vk.com/access_token?client_id=${VK_CLIENT_ID}&client_secret=${VK_CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&code=${code}`
    )
    const tokenData = await tokenRes.json()

    if (tokenData.error || !tokenData.user_id) {
      console.error('VK token error:', tokenData)
      return NextResponse.redirect(new URL('/?vk_err=token_failed', request.url))
    }

    const userId = tokenData.user_id

    // Шаг 2: проверить членство в группе через service token
    const memberRes = await fetch(
      `https://api.vk.com/method/groups.isMember?group_id=${VK_GROUP_ID}&user_id=${userId}&access_token=${VK_SERVICE_TOKEN}&v=5.199`
    )
    const memberData = await memberRes.json()

    const isMember = memberData.response === 1

    if (isMember) {
      // Подписан — открываем калькулятор
      return NextResponse.redirect(new URL('/?vk_ok=1', request.url))
    } else {
      // Не подписан — возвращаем с ошибкой
      return NextResponse.redirect(new URL('/?vk_err=not_member', request.url))
    }
  } catch (err) {
    console.error('VK callback error:', err)
    return NextResponse.redirect(new URL('/?vk_err=server_error', request.url))
  }
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/check-vk-subscription
 * Серверная проверка подписки пользователя на группу ВКонтакте
 * через VK API метод groups.isMember.
 *
 * Body: { userId: number | string }
 * Returns: { isMember: boolean } или { error: string }
 *
 * Необходимые переменные окружения (серверные, не NEXT_PUBLIC_):
 *   VK_SERVICE_TOKEN  — сервисный ключ VK-приложения (не попадает на клиент)
 *   VK_GROUP_ID       — числовой ID группы без минуса (например 143228474)
 */

const VK_API_VERSION = '5.131'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body?.userId

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      )
    }

    const serviceToken = process.env.VK_SERVICE_TOKEN
    const groupId = process.env.VK_GROUP_ID

    if (!serviceToken || !groupId) {
      console.error('[check-vk-subscription] VK_SERVICE_TOKEN или VK_GROUP_ID не заданы')
      return NextResponse.json(
        { error: 'Сервер не настроен: отсутствуют VK_SERVICE_TOKEN / VK_GROUP_ID' },
        { status: 500 }
      )
    }

    const url = new URL('https://api.vk.com/method/groups.isMember')
    url.searchParams.set('group_id', String(groupId))
    url.searchParams.set('user_id', String(userId))
    url.searchParams.set('access_token', serviceToken)
    url.searchParams.set('v', VK_API_VERSION)

    const vkResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })

    if (!vkResponse.ok) {
      console.error('[check-vk-subscription] VK API HTTP error', vkResponse.status)
      return NextResponse.json(
        { error: 'Ошибка соединения с VK API' },
        { status: 502 }
      )
    }

    const vkData = await vkResponse.json()

    if (vkData.error) {
      console.error('[check-vk-subscription] VK API error:', vkData.error)
      return NextResponse.json(
        { error: `VK API: ${vkData.error.error_msg}` },
        { status: 502 }
      )
    }

    // groups.isMember возвращает 0 или 1
    const isMember = vkData.response === 1

    return NextResponse.json({ isMember })
  } catch (err: unknown) {
    console.error('[check-vk-subscription] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

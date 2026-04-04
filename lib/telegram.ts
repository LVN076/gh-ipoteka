import { LeadData } from './bitrix24'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003227463205'
const THREAD_ID = process.env.TELEGRAM_THREAD_ID || '9'

export async function sendLeadToTelegram(data: LeadData): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN не задан, пропускаем')
    return
  }

  const source = data.source === 'vk_subscribe_flow' ? '🔵 ВКонтакте' : '📱 Телефон'

  const lines: string[] = [
    '🔔 *Новая заявка с калькулятора*',
    '',
    `👤 *Имя:* ${escmd(data.name)}`,
    `📞 *Телефон:* ${escmd(data.phone)}`,
    `📌 *Источник:* ${source}`,
  ]

  if (data.programName)    lines.push(`🏠 *Программа:* ${escmd(data.programName)}`)
  if (data.propertyPrice)  lines.push(`💰 *Стоимость:* ${escmd(data.propertyPrice.toLocaleString('ru-RU'))} руб\.`)
  if (data.downPayment)    lines.push(`💳 *Взнос:* ${escmd(data.downPayment.toLocaleString('ru-RU'))} руб\.`)
  if (data.termYears)      lines.push(`📅 *Срок:* ${escmd(String(data.termYears))} лет`)
  if (data.monthlyPayment) lines.push(`💵 *Платёж/мес:* ${escmd(data.monthlyPayment.toLocaleString('ru-RU'))} руб\.`)

  if (data.utm_source || data.utm_medium || data.utm_campaign) {
    lines.push('')
    lines.push('📊 *UTM:*')
    if (data.utm_source)   lines.push(`  source: ${escmd(data.utm_source)}`)
    if (data.utm_medium)   lines.push(`  medium: ${escmd(data.utm_medium)}`)
    if (data.utm_campaign) lines.push(`  campaign: ${escmd(data.utm_campaign)}`)
  }

  const text = lines.join('\n')

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body: Record<string, unknown> = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'MarkdownV2',
  }
  if (THREAD_ID) body.message_thread_id = Number(THREAD_ID)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error('[Telegram] sendMessage error:', json)
    } else {
      console.log('[Telegram] лид отправлен, message_id:', json.result?.message_id)
    }
  } catch (err) {
    console.error('[Telegram] fetch error:', err)
  }
}

// Экранирование спецсимволов MarkdownV2
function escmd(str: string): string {
  return str.replace(/[_*[]()~`>#+=|{}.!\\-]/g, '\\$&')
}

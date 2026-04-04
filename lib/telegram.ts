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
    '🔔 <b>Новая заявка с калькулятора</b>',
    '',
    `👤 <b>Имя:</b> ${esc(data.name)}`,
    `📞 <b>Телефон:</b> ${esc(data.phone)}`,
    `📌 <b>Источник:</b> ${source}`,
  ]

  if (data.programName)    lines.push(`🏠 <b>Программа:</b> ${esc(data.programName)}`)
  if (data.propertyPrice)  lines.push(`💰 <b>Стоимость:</b> ${esc(data.propertyPrice.toLocaleString('ru-RU'))} руб.`)
  if (data.downPayment)    lines.push(`💳 <b>Взнос:</b> ${esc(data.downPayment.toLocaleString('ru-RU'))} руб.`)
  if (data.termYears)      lines.push(`📅 <b>Срок:</b> ${esc(String(data.termYears))} лет`)
  if (data.monthlyPayment) lines.push(`💵 <b>Платёж/мес:</b> ${esc(data.monthlyPayment.toLocaleString('ru-RU'))} руб.`)

  if (data.utm_source || data.utm_medium || data.utm_campaign) {
    lines.push('')
    lines.push('📊 <b>UTM:</b>')
    if (data.utm_source)   lines.push(`  source: ${esc(data.utm_source)}`)
    if (data.utm_medium)   lines.push(`  medium: ${esc(data.utm_medium)}`)
    if (data.utm_campaign) lines.push(`  campaign: ${esc(data.utm_campaign)}`)
  }

  const text = lines.join('\n')

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const body: Record<string, unknown> = {
    chat_id: CHAT_ID,
    text,
    parse_mode: 'HTML',
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
      console.error('[Telegram] sendMessage error:', JSON.stringify(json))
    } else {
      console.log('[Telegram] лид отправлен, message_id:', json.result?.message_id)
    }
  } catch (err) {
    console.error('[Telegram] fetch error:', err)
  }
}

// Экранирование HTML-спецсимволов
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

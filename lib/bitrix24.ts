import { SITE_CONFIG } from './config'

export interface LeadData {
  name: string
  phone: string
  source: 'vk_subscribe_flow' | 'phone_lead'
  programName?: string
  propertyPrice?: number
  downPayment?: number
  termYears?: number
  monthlyPayment?: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
}

export async function sendLeadToBitrix24(data: LeadData): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = SITE_CONFIG.bitrix24WebhookUrl

  if (!webhookUrl || webhookUrl.includes('YOUR_DOMAIN')) {
    console.warn('[Bitrix24] Webhook URL не настроен. Лид не отправлен.')
    return { success: true } // не блокируем пользователя если вебхук не настроен
  }

  try {
    // Комментарий с параметрами расчёта
    const comments = [
      `Источник: ${SITE_CONFIG.sourceTag}`,
      `Тип конверсии: ${data.source === 'vk_subscribe_flow' ? 'Подписка ВК' : 'Форма телефона'}`,
      data.programName ? `Программа ипотеки: ${data.programName}` : '',
      data.propertyPrice ? `Стоимость объекта: ${data.propertyPrice.toLocaleString('ru-RU')} руб.` : '',
      data.downPayment ? `Первоначальный взнос: ${data.downPayment.toLocaleString('ru-RU')} руб.` : '',
      data.termYears ? `Срок ипотеки: ${data.termYears} лет` : '',
      data.monthlyPayment ? `Ежемесячный платёж: ${data.monthlyPayment.toLocaleString('ru-RU')} руб.` : '',
      '',
      data.utm_source ? `UTM Source: ${data.utm_source}` : '',
      data.utm_medium ? `UTM Medium: ${data.utm_medium}` : '',
      data.utm_campaign ? `UTM Campaign: ${data.utm_campaign}` : '',
      data.utm_content ? `UTM Content: ${data.utm_content}` : '',
      data.utm_term ? `UTM Term: ${data.utm_term}` : '',
      data.referrer ? `Referrer: ${data.referrer}` : '',
    ].filter(Boolean).join('\n')

    const payload = {
      fields: {
        TITLE: `Заявка с калькулятора — ${data.name}`,
        NAME: data.name,
        PHONE: [{ VALUE: data.phone, VALUE_TYPE: 'WORK' }],
        STATUS_ID: 'NEW',
        SOURCE_ID: 'WEB',
        SOURCE_DESCRIPTION: SITE_CONFIG.sourceTag,
        COMMENTS: comments,
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('[Bitrix24] Ошибка отправки лида:', error)
    return { success: false, error: String(error) }
  }
}

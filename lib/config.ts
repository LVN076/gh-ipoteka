// ============================================================
// ГЛАВНЫЙ КОНФИГ — редактируйте без страха
// ============================================================

export const SITE_CONFIG = {
  projectName: 'Good House',
  vkGroupUrl: process.env.NEXT_PUBLIC_VK_GROUP_URL || 'https://vk.com/goodhouse_yar',
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/goodhouse',
  bitrix24WebhookUrl: process.env.NEXT_PUBLIC_BITRIX24_WEBHOOK || 'https://YOUR_DOMAIN.bitrix24.ru/rest/1/YOUR_KEY/crm.lead.add.json',
  yandexMetrikaId: process.env.NEXT_PUBLIC_YM_ID || '',
  sourceTag: 'mortgage_calculator_vk',
}

export interface MortgageProgram {
  id: string
  name: string
  rate: number
  minDownPaymentPct: number
  hint?: string
  badge?: string
}

export const MORTGAGE_PROGRAMS: MortgageProgram[] = [
  {
    id: 'family',
    name: 'Семейная ипотека',
    rate: 6,
    minDownPaymentPct: 20,
    hint: 'Для семей с детьми до 18 лет',
    badge: 'Популярная',
  },

 // {
 //   id: 'rural',
 //   name: 'Сельская ипотека',
 //   rate: 3,
 //   minDownPaymentPct: 10,
 //   hint: 'Для строительства в сельской местности',
 //   badge: 'Низкая ставка',
 // },
  {
    id: 'it',
    name: 'IT-ипотека',
    rate: 6,
    minDownPaymentPct: 20,
    hint: 'Для сотрудников аккредитованных IT-компаний',
  },
  {
    id: 'standard',
        name: 'Рыночная ипотека',
        rate: 17.4,
        minDownPaymentPct: 20,
    hint: 'Без ограничений по категориям',
  },
]

export const MORTGAGE_TERMS_YEARS = [10, 15, 20, 25, 30]

export const TEXTS = {
  hero: {
    title: 'Рассчитайте ипотеку\nна дом за 1 минуту',
    subtitle: 'Предварительно рассчитаем ежемесячный платёж по льготной ипотечной программе. Точная ставка зависит от банка и параметров клиента.',
    cta: 'Начать расчёт',
  },
  access: {
    title: 'Выберите удобный способ\nполучить доступ к расчёту',
    vkButton: 'Подписаться на группу ВКонтакте',
    vkDesc: 'Быстро и без лишних данных',
    phoneButton: 'Оставить имя и телефон',
    phoneDesc: 'Перезвоним и поможем с выбором',
  },
  vkScreen: {
    title: 'Подпишитесь на нашу группу',
    desc: 'После подписки вы получите доступ к калькулятору и будете первыми узнавать о новых проектах и акциях',
    openVkButton: 'Открыть группу ВКонтакте',
    confirmButton: 'Я подписался — продолжить',
  },
  leadForm: {
    title: 'Оставьте контакт',
    desc: 'Рассчитайте платёж прямо сейчас — перезвоним и ответим на вопросы',
    namePlaceholder: 'Ваше имя',
    phonePlaceholder: '+7 (___) ___-__-__',
    submitButton: 'Получить доступ к расчёту',
    privacyText: 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных',
  },
  calculator: {
    title: 'Ипотечный калькулятор',
    programLabel: 'Программа ипотеки',
    programPlaceholder: 'Выберите программу',
    priceLabel: 'Стоимость недвижимости / строительства',
    downPaymentLabel: 'Первоначальный взнос',
    termLabel: 'Срок ипотеки',
    calculateButton: 'Рассчитать платёж',
  },
  result: {
    monthlyLabel: 'Ежемесячный платёж',
    loanAmountLabel: 'Сумма кредита',
    rateLabel: 'Процентная ставка',
    termLabel: 'Срок',
    totalLabel: 'Общая сумма выплат',
    recalcButton: 'Пересчитать',
    ctaButton: 'Получить консультацию',
    disclaimer: 'Расчёт является предварительным и носит информационный характер. Точные условия кредитования определяются банком индивидуально на основании документов заёмщика.',
  },
}

export const DISCLAIMER = TEXTS.result.disclaimer

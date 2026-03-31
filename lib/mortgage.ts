// ============================================================
// ЛОГИКА РАСЧЁТА ИПОТЕКИ
// ============================================================

export interface CalculatorInput {
  programId: string
  programName: string
  rate: number          // годовая ставка %
  propertyPrice: number // стоимость объекта, руб.
  downPayment: number   // первоначальный взнос, руб.
  termYears: number     // срок, лет
}

export interface CalculatorResult {
  loanAmount: number        // сумма кредита
  monthlyPayment: number    // ежемесячный платёж
  totalPayment: number      // общая сумма выплат
  totalInterest: number     // переплата
  termMonths: number        // срок в месяцах
  downPaymentPct: number    // взнос в %
}

/**
 * Аннуитетный расчёт ипотеки
 * A = S × (i × (1 + i)^n) / ((1 + i)^n − 1)
 */
export function calculateMortgage(input: CalculatorInput): CalculatorResult {
  const { propertyPrice, downPayment, rate, termYears } = input

  const loanAmount = propertyPrice - downPayment
  const termMonths = termYears * 12
  const monthlyRate = rate / 100 / 12

  let monthlyPayment: number

  if (monthlyRate === 0) {
    // Беспроцентный (теоретически)
    monthlyPayment = loanAmount / termMonths
  } else {
    const pow = Math.pow(1 + monthlyRate, termMonths)
    monthlyPayment = loanAmount * (monthlyRate * pow) / (pow - 1)
  }

  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - loanAmount
  const downPaymentPct = (downPayment / propertyPrice) * 100

  return {
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    termMonths,
    downPaymentPct: Math.round(downPaymentPct * 10) / 10,
  }
}

// ============================================================
// ФОРМАТИРОВАНИЕ ЧИСЕл
// ============================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export function parseNumber(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0
}

export function formatInputNumber(value: string): string {
  const num = parseNumber(value)
  if (!num) return ''
  return formatNumber(num)
}

// ============================================================
// UTM / АНАЛИТИКА
// ============================================================

export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    referrer: document.referrer || '',
  }
}

// Яндекс Метрика
export function ymEvent(id: string, eventName: string, params?: object) {
  if (typeof window === 'undefined') return
  // @ts-ignore
  if (window.ym && id) {
    // @ts-ignore
    window.ym(id, 'reachGoal', eventName, params)
  }
}

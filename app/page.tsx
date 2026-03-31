'use client'

import { useState, useEffect } from 'react'
import HeroScreen from '@/components/HeroScreen'
import AccessScreen from '@/components/AccessScreen'
import VKScreen from '@/components/VKScreen'
import LeadFormScreen from '@/components/LeadFormScreen'
import CalculatorScreen from '@/components/CalculatorScreen'
import ResultScreen from '@/components/ResultScreen'
import { CalculatorResult, ymEvent, getUtmParams } from '@/lib/mortgage'
import { SITE_CONFIG } from '@/lib/config'

type Screen =
  | 'hero'
  | 'access'
  | 'vk'
  | 'lead-form'
  | 'calculator'
  | 'result'

interface CalcInput {
  programName: string
  propertyPrice: number
  downPayment: number
  termYears: number
  rate: number
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('hero')
  const [userName, setUserName] = useState<string | undefined>()
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null)
  const [calcInput, setCalcInput] = useState<CalcInput | null>(null)

  // Track UTMs on load, send page_view event
  useEffect(() => {
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'page_view', getUtmParams())
  }, [])

  const go = (next: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScreen(next)
  }

  // Handlers
  const handleStart = () => {
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'click_start')
    go('access')
  }

  const handleChooseVK = () => {
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'choose_vk_subscribe')
    go('vk')
  }

  const handleChoosePhone = () => {
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'choose_phone_form')
    go('lead-form')
  }

  const handleVKConfirm = () => {
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'open_calculator')
    go('calculator')
  }

  const handleLeadSuccess = (name: string, phone: string) => {
    setUserName(name)
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'open_calculator')
    go('calculator')
  }

  const handleResult = (result: CalculatorResult, input: CalcInput) => {
    setCalcResult(result)
    setCalcInput(input)
    ymEvent(SITE_CONFIG.yandexMetrikaId, 'final_success')
    go('result')
  }

  const handleRecalculate = () => {
    go('calculator')
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'var(--color-bg)',
        position: 'relative',
      }}
    >
      {screen === 'hero' && (
        <HeroScreen onStart={handleStart} />
      )}

      {screen === 'access' && (
        <AccessScreen
          onVK={handleChooseVK}
          onPhone={handleChoosePhone}
          onBack={() => go('hero')}
        />
      )}

      {screen === 'vk' && (
        <VKScreen
          onConfirm={handleVKConfirm}
          onBack={() => go('access')}
        />
      )}

      {screen === 'lead-form' && (
        <LeadFormScreen
          onSuccess={handleLeadSuccess}
          onBack={() => go('access')}
        />
      )}

      {screen === 'calculator' && (
        <CalculatorScreen
          onResult={handleResult}
          userName={userName}
        />
      )}

      {screen === 'result' && calcResult && calcInput && (
        <ResultScreen
          result={calcResult}
          input={calcInput}
          onRecalculate={handleRecalculate}
          userName={userName}
        />
      )}
    </main>
  )
}

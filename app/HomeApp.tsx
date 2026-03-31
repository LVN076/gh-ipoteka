'use client'

import { useState, useEffect } from 'react'
import HeroScreen from '../components/HeroScreen'
import AccessScreen from '../components/AccessScreen'
import VKScreen from '../components/VKScreen'
import LeadFormScreen from '../components/LeadFormScreen'
import CalculatorScreen from '../components/CalculatorScreen'
import ResultScreen from '../components/ResultScreen'
import { CalculatorResult } from '../lib/mortgage'
import { SITE_CONFIG } from '../lib/config'

type Screen = 'hero' | 'access' | 'vk' | 'lead' | 'calculator' | 'result'

interface CalcInput {
  programName: string
  propertyPrice: number
  downPayment: number
  termYears: number
  rate: number
}

export default function HomeApp() {
  const [screen, setScreen] = useState<Screen>('hero')
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('')
  const [calcResult, setCalcResult] = useState<CalculatorResult | null>(null)
  const [calcInput, setCalcInput] = useState<CalcInput | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && (window as any).ym) {
      ;(window as any).ym(SITE_CONFIG.yandexMetrikaId, 'hit', window.location.pathname)
    }
  }, [])

  if (!mounted) return null

  const handleStart = () => setScreen('access')
  const handleVKConfirm = () => setScreen('calculator')

  const handleVK = () => setScreen('vk')
  const handlePhone = () => setScreen('lead')

  const handleLeadSuccess = (name: string) => {
    setUserName(name)
    setScreen('calculator')
  }

  const handleResult = (result: CalculatorResult, input: CalcInput) => {
    setCalcResult(result)
    setCalcInput(input)
    setScreen('result')
  }

  const handleRecalculate = () => setScreen('calculator')

  return (
    <main className="min-h-screen bg-background">
      {screen === 'hero' && <HeroScreen onStart={handleStart} />}
      {screen === 'access' && (
        <AccessScreen
          onVK={handleVK}
          onPhone={handlePhone}
          onBack={() => setScreen('hero')}
        />
      )}
      {screen === 'vk' && (
        <VKScreen
          onConfirm={handleVKConfirm}
          onBack={() => setScreen('access')}
        />
      )}
      {screen === 'lead' && (
        <LeadFormScreen
          onSuccess={handleLeadSuccess}
          onBack={() => setScreen('access')}
        />
      )}
      {screen === 'calculator' && (
        <CalculatorScreen
          userName={userName}
          onResult={handleResult}
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

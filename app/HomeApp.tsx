'use client'

import { useState, useEffect } from 'react'
import HeroScreen from '../components/HeroScreen'
import AccessScreen from '../components/AccessScreen'
import VKScreen from '../components/VKScreen'
import LeadFormScreen from '../components/LeadFormScreen'
import CalculatorScreen from '../components/CalculatorScreen'
import ResultScreen from '../components/ResultScreen'
import { calculateMortgage } from '../lib/mortgage'
import { SITE_CONFIG, MORTGAGE_PROGRAMS } from '../lib/config'

type Screen = 'hero' | 'access' | 'vk' | 'lead' | 'calculator' | 'result'

interface CalcInput {
  programId: string
  propertyPrice: number
  downPayment: number
  termYears: number
}

export default function HomeApp() {
  const [screen, setScreen] = useState<Screen>('hero')
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('')
  const [calcResult, setCalcResult] = useState<ReturnType<typeof calculateMortgage> | null>(null)
  const [calcInput, setCalcInput] = useState<CalcInput>({
    programId: 'family',
    propertyPrice: 5000000,
    downPayment: 1500000,
    termYears: 20,
  })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && (window as any).ym) {
      ;(window as any).ym(SITE_CONFIG.yandexMetrikaId, 'hit', window.location.pathname)
    }
  }, [])

  if (!mounted) return null

  const handleStart = () => setScreen('access')
  const handleChooseVK = () => setScreen('vk')
  const handleChoosePhone = () => setScreen('lead')
  const handleVKConfirm = () => setScreen('calculator')

  const handleLeadSuccess = (name: string) => {
    setUserName(name)
    setScreen('calculator')
  }

  const handleResult = (input: CalcInput) => {
    setCalcInput(input)
    const program = MORTGAGE_PROGRAMS.find((p) => p.id === input.programId)
    if (!program) return
    const result = calculateMortgage({
      propertyPrice: input.propertyPrice,
      downPayment: input.downPayment,
      termYears: input.termYears,
      annualRate: program.rate,
    })
    setCalcResult(result)
    setScreen('result')
  }

  const handleRecalculate = () => setScreen('calculator')

  return (
    <main className="min-h-screen bg-background">
      {screen === 'hero' && <HeroScreen onStart={handleStart} />}
      {screen === 'access' && <AccessScreen onChooseVK={handleChooseVK} onChoosePhone={handleChoosePhone} />}
      {screen === 'vk' && <VKScreen onConfirm={handleVKConfirm} />}
      {screen === 'lead' && <LeadFormScreen onSuccess={handleLeadSuccess} />}
      {screen === 'calculator' && (
        <CalculatorScreen
          userName={userName}
          initialInput={calcInput}
          onResult={handleResult}
        />
      )}
      {screen === 'result' && calcResult && (
        <ResultScreen
          result={calcResult}
          input={calcInput}
          onRecalculate={handleRecalculate}
        />
      )}
    </main>
  )
}

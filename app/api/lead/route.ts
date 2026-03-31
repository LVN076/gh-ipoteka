import { NextRequest, NextResponse } from 'next/server'
import { sendLeadToBitrix24, LeadData } from '@/lib/bitrix24'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leadData: LeadData = body

    if (!leadData.name || !leadData.phone) {
      return NextResponse.json({ success: false, error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    const result = await sendLeadToBitrix24(leadData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API/lead]', error)
    return NextResponse.json({ success: false, error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // TEMPORARY MOCK — Gemini free tier congested, swap back before demo
  await new Promise((r) => setTimeout(r, 1000))

  return NextResponse.json({
    violation_type: 'red_light',
    plate_text: 'KDA 123X',
    confidence: 'high',
    notes: 'Vehicle observed crossing the intersection after signal turned red.'
  })
}

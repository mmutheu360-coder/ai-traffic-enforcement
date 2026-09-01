import { NextRequest, NextResponse } from 'next/server'

const MOCK_RESULTS = [
  { violation_type: 'red_light', plate_text: 'KDA 123X', confidence: 'high', notes: 'Vehicle observed crossing the intersection after signal turned red.' },
  { violation_type: 'illegal_parking', plate_text: 'KCB 456Y', confidence: 'medium', notes: 'Vehicle parked in a no-parking zone blocking pedestrian crossing.' },
  { violation_type: 'wrong_lane', plate_text: 'KDD 789Z', confidence: 'high', notes: 'Vehicle observed driving in the designated bus lane.' },
  { violation_type: 'speeding', plate_text: 'KCF 321A', confidence: 'medium', notes: 'Vehicle appears to be traveling above the posted speed limit.' },
  { violation_type: 'phone_use', plate_text: 'KDG 654B', confidence: 'low', notes: 'Driver appears to be holding a mobile device while vehicle is in motion.' },
]

export async function POST(req: NextRequest) {
  // TEMPORARY MOCK — Gemini free tier congested, swap back before demo
  await new Promise((r) => setTimeout(r, 1000))

  const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]

  return NextResponse.json(result)
}

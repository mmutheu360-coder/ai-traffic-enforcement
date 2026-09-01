import { NextRequest, NextResponse } from 'next/server'

const MOCK_FALLBACKS = [
  { violation_type: 'red_light', plate_text: 'KDA 123X', confidence: 'high', notes: 'Vehicle observed crossing the intersection after signal turned red.' },
  { violation_type: 'illegal_parking', plate_text: 'KCB 456Y', confidence: 'medium', notes: 'Vehicle parked in a no-parking zone blocking pedestrian crossing.' },
  { violation_type: 'wrong_lane', plate_text: 'KDD 789Z', confidence: 'high', notes: 'Vehicle observed driving in the designated bus lane.' },
]

async function callGemini(imageBase64: string, mimeType: string) {
  const prompt = `You are a traffic enforcement AI analyzing a photo for possible traffic violations.

Look at the image and respond ONLY with a JSON object in this exact format, nothing else, no markdown:

{
  "violation_type": "one of: red_light, illegal_parking, wrong_lane, no_seatbelt, phone_use, speeding, none",
  "plate_text": "the license plate text if visible, otherwise null",
  "confidence": "high, medium, or low",
  "notes": "one short sentence describing what you observed"
}

If you don't see a clear traffic violation, set violation_type to "none".`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } }
          ]
        }]
      })
    }
  )

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || 'Gemini error')
  }

  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  text = text.replace(/```json/g, '').replace(/```/g, '').trim()

  return JSON.parse(text)
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

    const delays = [500, 1500, 3000] // ms between attempts

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const result = await callGemini(imageBase64, mimeType)
        return NextResponse.json({ ...result, _source: 'gemini' })

      } catch (err: any) {
        console.error(`GEMINI ATTEMPT ${attempt + 1} FAILED:`, err.message)

        const isLastAttempt = attempt === delays.length
        if (isLastAttempt) {
          // All retries exhausted — fall back to a mock so the demo never breaks
          const fallback = MOCK_FALLBACKS[Math.floor(Math.random() * MOCK_FALLBACKS.length)]
          return NextResponse.json({ ...fallback, _source: 'fallback' })
        }

        await new Promise((r) => setTimeout(r, delays[attempt]))
      }
    }

    // Should never reach here, but just in case
    return NextResponse.json({ violation_type: 'none', plate_text: null, confidence: 'low', notes: 'Analysis unavailable.', _source: 'fallback' })

  } catch (err: any) {
    console.error('ANALYZE ROUTE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

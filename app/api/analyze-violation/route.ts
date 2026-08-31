import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json()

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
      console.error('GEMINI ERROR:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    let result
    try {
      result = JSON.parse(text)
    } catch (e) {
      console.error('PARSE ERROR:', text)
      result = { violation_type: 'none', plate_text: null, confidence: 'low', notes: 'Could not parse AI response.' }
    }

    return NextResponse.json(result)

  } catch (err: any) {
    console.error('ANALYZE ROUTE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

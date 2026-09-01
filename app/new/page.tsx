'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewViolation() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(f)
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a photo.')
      return
    }

    setLoading(true)
    setMessage('Uploading photo...')

    try {
      // 1. Upload image to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`

      console.log('FILE NAME:', fileName)
      setMessage(`Uploading: ${fileName}`)
      await new Promise((r) => setTimeout(r, 1500))

      const { error: uploadError } = await supabase.storage
        .from('violation-photos')
        .upload(fileName, file)

      if (uploadError) {
        console.error('UPLOAD ERROR:', uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from('violation-photos')
        .getPublicUrl(fileName)

      const imageUrl = urlData.publicUrl

      // 2. Analyze with Gemini
      setMessage('Analyzing with AI...')

      const base64 = await fileToBase64(file)

      const analyzeRes = await fetch('/api/analyze-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type
        })
      })

      const analysis = await analyzeRes.json()

      if (analysis.error) {
        console.error('ANALYSIS ERROR:', analysis.error)
        throw new Error(analysis.error)
      }

      // 3. Save violation record
      setMessage('Saving...')

      const { error: insertError } = await supabase
        .from('violations')
        .insert({
          image_url: imageUrl,
          violation_type: analysis.violation_type,
          plate_text: analysis.plate_text,
          confidence: analysis.confidence,
          location: location || null,
          status: 'pending',
          ai_notes: analysis.notes
        })

      if (insertError) {
        console.error('INSERT ERROR:', insertError)
        throw insertError
      }

      setMessage('Saved successfully!')

      setTimeout(() => {
        window.location.href = '/'
      }, 500)

    } catch (err: any) {
      console.error('SUBMIT ERROR:', err)
      setMessage(`Error: ${err.name || 'Unknown'} — ${err.message || JSON.stringify(err)}`)
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-xl mx-auto space-y-4"
    >
      <h1 className="text-2xl font-bold">
        Report a Violation
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="border p-2 w-full"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full rounded border"
        />
      )}

      <input
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 w-full"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Processing...' : 'Analyze & Log Violation'}
      </button>

      {message && (
        <p className="text-sm mt-2">
          {message}
        </p>
      )}
    </form>
  )
                 }

'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ReviewButtons({
  violationId,
  currentStatus
}: {
  violationId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('violations')
        .update({ status })
        .eq('id', violationId)

      if (error) {
        console.error('STATUS UPDATE ERROR:', error)
        return
      }

      window.location.reload()

    } catch (err) {
      console.error('REVIEW ERROR:', err)
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus !== 'pending') {
    return (
      <p className="mt-4 text-sm text-gray-500">
        This violation has already been reviewed.
      </p>
    )
  }

  return (
    <div className="mt-4 flex gap-3">
      <button
        onClick={() => updateStatus('confirmed')}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ✓ Confirm Citation
      </button>

      <button
        onClick={() => updateStatus('dismissed')}
        disabled={loading}
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
      >
        ✗ Dismiss
      </button>
    </div>
  )
}

import Link from 'next/link'
import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: violations, error } = await supabase
    .from('violations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('VIOLATIONS LOAD ERROR:', error)
    return (
      <div className="p-6">
        <p className="text-red-600">Error loading violations: {error.message}</p>
      </div>
    )
  }

  const statusColor = (status: string) =>
    status === 'confirmed' ? 'bg-green-100 text-green-700'
    : status === 'dismissed' ? 'bg-gray-200 text-gray-500'
    : 'bg-yellow-100 text-yellow-700'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        AI Traffic Enforcement
      </h1>

      <Link
        href="/new"
        className="inline-block bg-red-600 text-white px-4 py-2 rounded"
      >
        + Report Violation
      </Link>
            <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="border rounded p-3 text-center">
          <p className="text-2xl font-bold">{violations?.length || 0}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>

        <div className="border rounded p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {violations?.filter(v => v.status === 'confirmed').length || 0}
          </p>
          <p className="text-xs text-gray-500">Confirmed</p>
        </div>

        <div className="border rounded p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {violations?.filter(v => v.status === 'pending').length || 0}
          </p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">

        {violations?.length === 0 && (
          <p>No violations logged yet.</p>
        )}

        {violations?.map((v) => (
          <Link
            key={v.id}
            href={`/violation/${v.id}`}
            className="block border p-3 rounded hover:bg-gray-50"
          >
            <div className="flex gap-3">
              <img
                src={v.image_url}
                alt="violation"
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <div className="flex justify-between">
                  <h2 className="font-bold">
                    {v.violation_type?.replace('_', ' ') || 'Unknown'}
                  </h2>

                  <span className={`text-xs px-2 py-1 rounded ${statusColor(v.status)}`}>
                    {v.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Plate: {v.plate_text || 'Not visible'} · {v.location || 'Unknown location'}
                </p>

                <p className="text-xs text-gray-400">
                  Confidence: {v.confidence}
                </p>
              </div>
            </div>
          </Link>
        ))}

      </div>
    </div>
  )
}

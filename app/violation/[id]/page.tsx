import { supabase } from '../../../lib/supabase'
import ReviewButtons from './ReviewButtons'

export const dynamic = 'force-dynamic'

export default async function ViolationDetail({
  params
}: {
  params: { id: string }
}) {
  const { data: violation, error } = await supabase
    .from('violations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    console.error('VIOLATION LOAD ERROR:', error)
  }

  if (!violation) {
    return <p className="p-6">Violation not found</p>
  }

  const statusColor =
    violation.status === 'confirmed' ? 'bg-green-100 text-green-700'
    : violation.status === 'dismissed' ? 'bg-gray-200 text-gray-500'
    : 'bg-yellow-100 text-yellow-700'

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <img
        src={violation.image_url}
        alt="violation"
        className="w-full rounded border"
      />

      <h1 className="text-2xl font-bold mt-4 capitalize">
        {violation.violation_type?.replace('_', ' ') || 'Unknown violation'}
      </h1>

      <span className={`text-sm px-2 py-1 rounded mt-1 inline-block ${statusColor}`}>
        {violation.status}
      </span>

      <div className="mt-4 space-y-1 text-sm">
        <p><strong>Plate:</strong> {violation.plate_text || 'Not visible'}</p>
        <p><strong>Confidence:</strong> {violation.confidence}</p>
        <p><strong>Location:</strong> {violation.location || 'Unknown'}</p>
        <p><strong>AI notes:</strong> {violation.ai_notes}</p>
        <p><strong>Reported:</strong> {new Date(violation.created_at).toLocaleString()}</p>
      </div>

      <ReviewButtons
        violationId={violation.id}
        currentStatus={violation.status}
      />
    </div>
  )
}

import { supabase } from '../../lib/supabase'
import MapView from './MapView'

export const dynamic = 'force-dynamic'

export default async function MapPage() {
  const { data: violations } = await supabase
    .from('violations')
    .select('*')
    .not('latitude', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Violation Map</h1>
      <MapView violations={violations ?? []} />
    </div>
  )
}

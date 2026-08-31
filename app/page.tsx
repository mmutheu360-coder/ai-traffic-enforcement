import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">AI Traffic Enforcement</h1>

      <Link
        href="/new"
        className="inline-block mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        + Report Violation
      </Link>
    </div>
  )
}

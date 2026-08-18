import { Suspense } from 'react'
import BenchmarkingContent from './BenchmarkingContent'

export default async function BenchmarkingPage() {
  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <BenchmarkingContent />
    </Suspense>
  )
}

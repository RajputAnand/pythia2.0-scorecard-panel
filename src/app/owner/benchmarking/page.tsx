import { Suspense } from 'react'
import BenchmarkingContent from '@/components/BenchmarkingContent/BenchmarkingContent'

export default async function BenchmarkingPage() {
  return (
    <Suspense fallback={<div className="h-[500px]" />}>
      <BenchmarkingContent />
    </Suspense>
  )
}

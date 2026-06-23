'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { makeQueryClient } from '@/lib/query-client'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures the client is created once per component lifetime,
  // safe in React 18+ concurrent mode and React 19.
  const [client] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

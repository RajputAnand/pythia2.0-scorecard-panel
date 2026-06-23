import { useQuery } from '@tanstack/react-query'
import { fakeGetOverview } from '@/mock/overviewAPIs'
import { queryKeys } from './keys'

export function fetchOverview() {
  return fakeGetOverview()
}

export function useOverviewQuery(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.overview.dashboard(storeId),
    queryFn: fetchOverview,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOverviewPageData() {
  const overview = useOverviewQuery()

  return {
    overview: overview.data,
    isLoading: overview.isLoading,
    isError: overview.isError,
    isFetching: overview.isFetching,
    isStale: overview.isStale,
    refetch: overview.refetch,
  }
}

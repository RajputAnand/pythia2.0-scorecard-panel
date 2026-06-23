import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fakeGet, fakePost } from '@/mock/swagStoreAPIs'
import type { SwagItem } from '@/types/swagstore'
import { queryKeys } from './keys'

// ---------------------------------------------------------------------------
// Query & mutation functions — colocated with their hooks.
// Swap fakeGet / fakePost for real fetch calls when the backend is ready.
// ---------------------------------------------------------------------------

export function fetchSwagStore() {
  return fakeGet()
}

export function redeemSwagItem(itemId: string) {
  return fakePost(itemId)
}

// ---------------------------------------------------------------------------
// Snapshot type inferred from the query function — no duplication needed.
// ---------------------------------------------------------------------------

type SwagSnapshot = Awaited<ReturnType<typeof fetchSwagStore>>

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useSwagStoreQuery() {
  return useQuery({
    queryKey: queryKeys.swag.store(),
    queryFn: fetchSwagStore,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRedeemSwagItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: SwagItem) => redeemSwagItem(item.id),

    // Optimistic update: deduct points and mark the item redeemed instantly.
    onMutate: async (item) => {
      // Cancel any in-flight refetch so it doesn't overwrite our optimistic state.
      await queryClient.cancelQueries({ queryKey: queryKeys.swag.store() })

      const previous = queryClient.getQueryData<SwagSnapshot>(queryKeys.swag.store())

      queryClient.setQueryData<SwagSnapshot>(queryKeys.swag.store(), (old) => {
        if (!old) return old
        return {
          points: old.points - item.cost,
          catalog: old.catalog.map((i) =>
            i.id === item.id ? { ...i, redeemed: true } : i,
          ),
        }
      })

      return { previous }
    },

    // Roll back on failure.
    onError: (_err, _item, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.swag.store(), context.previous)
      }
    },

    // Always sync with the server after settle — confirms or rolls back.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swag.store() })
    },
  })
}

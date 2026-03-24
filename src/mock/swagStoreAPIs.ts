
// ---------------------------------------------------------------------------
// Fake API layer — replace with real fetch calls when the backend is ready

import { SWAG_STORE } from "@/lib/swagstore-data";
import { SwagItem } from "@/types/swagstore";

// ---------------------------------------------------------------------------
export function fakeGet(): Promise<{ points: number; catalog: SwagItem[] }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ points: SWAG_STORE.initialPoints, catalog: SWAG_STORE.catalog }), 800)
  )
}

export function fakePost(_itemId: string): Promise<void> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (Math.random() < 0.15 ? reject(new Error('Server error')) : resolve()), 600)
  )
}
// ---------------------------------------------------------------------------

/** Persist checkout intent across login/register redirects */
const KEY = 'matucourse_pending_checkout'

export interface PendingCheckout {
  courseId: string
  returnPath: string
}

export function savePendingCheckout(data: PendingCheckout) {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function getPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingCheckout
  } catch {
    return null
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(KEY)
}

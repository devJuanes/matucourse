/** Firestore rejects undefined at any depth (objects, arrays, nested fields). */
export function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function stripUndefined<T>(value: T): T {
  if (value === undefined) return value
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as T
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        out[key] = stripUndefined(val)
      }
    }
    return out as T
  }
  return value
}

/** Build a lesson patch object with only allowed fields, never undefined. */
export function buildLessonPatch(data: Record<string, unknown>): Record<string, unknown> {
  const allowed = [
    'title',
    'description',
    'content',
    'unlocked',
    'duration',
    'videoUrl',
    'imageUrl',
    'codeExample',
    'meetingUrl',
  ]
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data && data[key] !== undefined) {
      patch[key] = data[key]
    }
  }
  return patch
}

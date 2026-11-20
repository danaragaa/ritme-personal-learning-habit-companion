/**
 * Generates a unique record ID compatible with all offline environments.
 */
export function generateId(prefix = 'rtm'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  const randomPart = Math.random().toString(36).substring(2, 11)
  const timestampPart = Date.now().toString(36)
  return `${prefix}_${timestampPart}_${randomPart}`
}

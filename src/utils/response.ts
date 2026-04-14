/**
 * Checks if the given data is a Response object.
 * Why not use "instanceof Response"?
 * Because in some environments the Response object might not be the same across
 * different contexts, leading to unreliable results with instanceof.
 */
export const isResponse = (data: unknown): data is Response => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'json' in data &&
    'status' in data &&
    'ok' in data &&
    'headers' in data
  )
}

export default function isDebugEnv() {
  if (import.meta.env.VITE_DEBUG === 'true') {
    return true
  }
  return false
}

export function isTestingEnv() {
  return import.meta.env.NODE_ENV === 'test'
}

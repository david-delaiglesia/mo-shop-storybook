import { useEffect, useState } from 'react'

import { useInterval } from './useInterval'

interface UsePollingOptions {
  interval: number
  enabled: boolean
  maxRetries?: number
  onMaxRetriesReached?: () => void
}

interface UsePollingResult<DataType> {
  data: DataType | null
}

export const usePolling = <DataType = unknown>(
  fetchFunction: () => Promise<DataType>,
  { interval, enabled, maxRetries, onMaxRetriesReached }: UsePollingOptions,
): UsePollingResult<DataType> => {
  const [data, setData] = useState<DataType | null>(null)
  const [retries, setRetries] = useState(0)

  const pollFunction = async () => {
    if (maxRetries && retries >= maxRetries) {
      onMaxRetriesReached?.()
      return
    }
    setRetries((prev) => prev + 1)
    const fetchedData = await fetchFunction()
    setData(fetchedData)
  }

  useEffect(() => {
    if (!enabled) return
    pollFunction()
  }, [enabled])

  useInterval(() => {
    if (!enabled) return
    pollFunction()
  }, interval)

  return { data }
}

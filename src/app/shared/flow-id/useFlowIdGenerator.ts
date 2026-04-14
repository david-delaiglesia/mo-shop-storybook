import { useRef } from 'react'

export const useFlowIdGenerator = () => {
  const flowId = useRef(crypto.randomUUID()).current

  return flowId
}

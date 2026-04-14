import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setPendingAction } from './actions'

export function useFeedback({ callback }) {
  const [actionUuid, setActionUuid] = useState(null)

  const dispatch = useDispatch()
  const { pendingActionUuid } = useSelector(({ pendingActionUuid }) => ({
    pendingActionUuid,
  }))

  const startFeedback = useCallback(
    (...args) => {
      const actionUuid = crypto.randomUUID()
      setActionUuid(actionUuid)
      dispatch(setPendingAction(actionUuid))

      callback?.(...args)
    },
    [callback],
  )

  const isFeedbackActive = useMemo(() => {
    if (!actionUuid) return false
    if (!pendingActionUuid) return false

    return pendingActionUuid === actionUuid
  }, [pendingActionUuid, actionUuid])

  return {
    startFeedback,
    isFeedbackActive,
  }
}

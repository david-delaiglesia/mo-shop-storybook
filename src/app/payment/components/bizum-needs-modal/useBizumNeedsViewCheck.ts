import { useEffect, useState } from 'react'

import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

export const useBizumNeedsViewCheck = () => {
  const [hasAlreadySeenBizumNeeds, setHasAlreadySeenBizumNeeds] = useState(true)

  useEffect(() => {
    const checkIfHasAlreadySeen = async () => {
      const item = await Storage.getItem(STORAGE_KEYS.BIZUM_USED_DIALOG)
      setHasAlreadySeenBizumNeeds(item?.hasAlreadySeen ?? false)
    }

    checkIfHasAlreadySeen()
  }, [])

  const onCloseBizumNeedsDialog = () => {
    Storage.setItem(STORAGE_KEYS.BIZUM_USED_DIALOG, { hasAlreadySeen: true })
    setHasAlreadySeenBizumNeeds(true)
  }

  return { hasAlreadySeenBizumNeeds, onCloseBizumNeedsDialog }
}

import { useCallback, useState } from 'react'

import { knownFeatureFlags, useFlag } from 'services/feature-flags'

const STORAGE_KEY = 'chat-sound-effects-active'

export const useChatSoundEffects = () => {
  const isWebNewSupportChatToggleSoundFlagActive = useFlag(
    knownFeatureFlags.WEB_NEW_SUPPORT_CHAT_TOGGLE_SOUND,
  )
  const [isSoundActive, setIsSoundActive] = useState(() => {
    if (!isWebNewSupportChatToggleSoundFlagActive) return false
    try {
      const storedValue = sessionStorage.getItem(STORAGE_KEY)
      return storedValue === 'true'
    } catch {
      return false
    }
  })

  const toggleSound = useCallback(() => {
    setIsSoundActive((prevValue) => {
      const newValue = !prevValue
      sessionStorage.setItem(STORAGE_KEY, String(newValue))

      return newValue
    })
  }, [])

  const setSoundDefaults = useCallback(() => {
    const storedValue = sessionStorage.getItem(STORAGE_KEY)
    if (storedValue !== null) return

    sessionStorage.setItem(STORAGE_KEY, 'true')
    setIsSoundActive(true)
  }, [])

  return {
    isSoundActive,
    toggleSound,
    setSoundDefaults,
  }
}

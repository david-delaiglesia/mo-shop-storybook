import { vi } from 'vitest'

vi.mock('services/support', async () => {
  const supportConstants = await vi.importActual('services/support/constants')
  return {
    Support: {
      initialize: vi.fn(),
      identify: vi.fn(),
      setLocale: vi.fn(),
      showButton: vi.fn(),
      hideButton: vi.fn(),
      openWidget: vi.fn(),
      setHelpCenterSuggestions: vi.fn(),
      sendMessage: vi.fn(),
      popoutChatWindow: vi.fn(),
      logout: vi.fn(),
      updateSettings: vi.fn(),
      ...supportConstants,
    },
  }
})

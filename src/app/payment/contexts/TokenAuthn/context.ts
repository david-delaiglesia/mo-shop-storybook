import { createContext } from 'react'

export interface TokenAuthnContextValue {
  isTokenAuthnFlow: boolean
  checkoutId?: number
  startTokenAuthnFlow?: () => void
}

export const TokenAuthnContext = createContext<TokenAuthnContextValue>({
  isTokenAuthnFlow: false,
})

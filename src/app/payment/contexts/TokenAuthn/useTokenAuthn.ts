import { useContext } from 'react'

import { TokenAuthnContext, TokenAuthnContextValue } from './context'

export const useTokenAuthn = (): TokenAuthnContextValue => {
  return useContext(TokenAuthnContext)
}

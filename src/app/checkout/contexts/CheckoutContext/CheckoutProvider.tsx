import { ReactNode, useEffect } from 'react'
import { Redirect, generatePath } from 'react-router'

import { CheckoutContext } from './CheckoutContext'
import { useCheckoutById } from './useCheckoutById'

import { CheckoutUtils } from 'app/checkout/CheckoutUtils'
import { Checkout } from 'app/checkout/interfaces'
import { useAppDispatch } from 'app/redux'
import { changeCheckout } from 'pages/create-checkout/actions'
import { PATHS } from 'pages/paths'

interface CheckoutProviderProps {
  checkoutId: Checkout['id']
  children: ReactNode
}

export const CheckoutProvider = ({
  checkoutId,
  children,
}: CheckoutProviderProps) => {
  const { checkout, isLoading, refetchCheckout } = useCheckoutById(checkoutId)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (checkout) {
      dispatch(changeCheckout(checkout))
    }
  }, [checkout])

  return (
    <CheckoutContext.Provider
      value={{
        checkout: checkout ?? undefined,
        checkoutId,
        isLoading,
        refetchCheckout,
      }}
    >
      {checkout &&
        (CheckoutUtils.isConfirmed(checkout) ? (
          <Redirect
            to={generatePath(PATHS.PURCHASE_CONFIRMATION, {
              id: checkout.orderId,
            })}
          />
        ) : (
          children
        ))}
    </CheckoutContext.Provider>
  )
}

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { AddressModalContainer } from 'app/address/containers/address-modal-container'
import { updateDeliveryArea } from 'app/authentication/commands'
import { PostalCodeFormContainer } from 'app/delivery-area/containers/postal-code-form-container'
import { DeliveryAreaPubSub } from 'services/http'

const DeliveryAreaContainer = () => {
  const { isAuth } = useSelector((state) => state.session)
  const { isDeliveryAreaOpened } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const sessionRef = useRef({})

  const updateDeliveryAreaInfo = ({ warehouse, postalCode }) => {
    const session = { warehouse, postalCode }
    if (sessionRef.current !== session) {
      sessionRef.current = session
      dispatch(createThunk(updateDeliveryArea)(session))
    }
  }

  useEffect(() => {
    DeliveryAreaPubSub.subscribe(updateDeliveryAreaInfo)
  }, [])

  if (!isDeliveryAreaOpened) {
    return null
  }

  if (isAuth) {
    return <AddressModalContainer />
  }

  return <PostalCodeFormContainer />
}

export { DeliveryAreaContainer }

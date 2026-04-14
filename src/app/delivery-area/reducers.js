import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

export const INITIAL_STATE = false

export const isDeliveryAreaOpened = createReducer(INITIAL_STATE, {
  [actionTypes.OPEN_DELIVERY_AREA_MODAL]: () => true,
  [actionTypes.CLOSE_DELIVERY_AREA_MODAL]: () => false,
})

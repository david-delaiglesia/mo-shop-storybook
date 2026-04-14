import { constants } from '../../utils/constants'
import { SAVE_MAXIMUM_WATER_LITERS_FOR_CART_ORDER } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {
  maximumWaterLitersForCartOrder: constants.MAX_WATER_LITERS,
}

export const config = createReducer(INITIAL_STATE, {
  [SAVE_MAXIMUM_WATER_LITERS_FOR_CART_ORDER]: (state, payload) => {
    return {
      ...state,
      maximumWaterLitersForCartOrder: payload.waterLimit,
    }
  },
})

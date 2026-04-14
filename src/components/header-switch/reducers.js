import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

import { LayoutHeaderType } from 'components/header-switch/constants'

const headerType = createReducer(LayoutHeaderType.DEFAULT, {
  [actionTypes.SET_HEADER_TYPE](state, headerType) {
    return headerType
  },
})

export { headerType }

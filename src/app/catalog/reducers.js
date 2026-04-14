import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {
  productId: null,
  productSlug: null,
  editingOrder: false,
  source: null,
  sourceCode: null,
}

const productModal = createReducer(INITIAL_STATE, {
  [actionTypes.SET_PRODUCT_TO_SHOW](
    state,
    {
      productId,
      productSlug,
      source,
      sourceCode,
      warehouse,
      originLayout,
      campaign,
      page,
      section,
      position,
      sectionPosition,
    },
  ) {
    return {
      ...state,
      productId,
      productSlug,
      source,
      sourceCode,
      warehouse,
      originLayout,
      campaign,
      page,
      section,
      position,
      sectionPosition,
    }
  },

  [actionTypes.CLEAN_PRODUCT_TO_SHOW]({ editingOrder }) {
    return { ...INITIAL_STATE, editingOrder }
  },

  [actionTypes.SET_EDITING_ORDER_MODE]: (state) => ({
    ...state,
    editingOrder: true,
  }),

  [actionTypes.UNSET_EDITING_ORDER_MODE]: (state) => ({
    ...state,
    editingOrder: false,
  }),
})

export { productModal }

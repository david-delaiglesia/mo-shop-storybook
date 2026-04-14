import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {}

const search = createReducer(INITIAL_STATE, {
  [actionTypes.FILTER_CATEGORIES_SEARCH]: (search, payload) => ({
    ...search,
    ...payload,
  }),
  [actionTypes.FILTER_BRANDS_SEARCH]: (search, payload) => ({
    ...search,
    ...payload,
  }),
  [actionTypes.UPDATE_SEARCH]: (search, payload) => ({
    ...search,
    ...payload,
  }),
  [actionTypes.CLEAR_SEARCH]: () => ({
    query: '',
    queryID: '',
    hits: [],
    brands: [],
    categories: [],
  }),
})

export { search }

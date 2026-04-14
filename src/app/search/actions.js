export const actionTypes = {
  UPDATE_SEARCH: 'UPDATE_SEARCH',
  FILTER_BRANDS_SEARCH: 'FILTER_BRANDS_SEARCH',
  FILTER_CATEGORIES_SEARCH: 'FILTER_CATEGORIES_SEARCH',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
}

export function updateSearch(query, queryID, hits, categories, brands) {
  return (dispatch) => {
    const action = {
      type: actionTypes.UPDATE_SEARCH,
      payload: { query, queryID, hits, categories, brands },
    }
    dispatch(action)
  }
}

export function filterBrandsSearch(hits, categories) {
  return (dispatch) => {
    const action = {
      type: actionTypes.FILTER_BRANDS_SEARCH,
      payload: { hits, categories },
    }
    dispatch(action)
  }
}

export function filterCategoriesSearch(hits, brands) {
  return (dispatch) => {
    const action = {
      type: actionTypes.FILTER_CATEGORIES_SEARCH,
      payload: { hits, brands },
    }
    dispatch(action)
  }
}

export function clearSearch() {
  return (dispatch) => {
    const action = {
      type: actionTypes.CLEAR_SEARCH,
    }
    dispatch(action)
  }
}

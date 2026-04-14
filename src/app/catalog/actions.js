export const actionTypes = {
  SET_PRODUCT_TO_SHOW: 'PRODUCT_MODAL/SET_PRODUCT_TO_SHOW',
  CLEAN_PRODUCT_TO_SHOW: 'PRODUCT_MODAL/CLEAN_PRODUCT_TO_SHOW',
  SET_EDITING_ORDER_MODE: 'SET_EDITING_ORDER_MODE',
  UNSET_EDITING_ORDER_MODE: 'UNSET_EDITING_ORDER_MODE',
}

export function setProductModalProductToShow(
  productId,
  productSlug,
  source,
  sourceCode,
  warehouse,
  layout,
  campaign,
  page,
  section,
  position,
  sectionPosition,
) {
  return {
    type: actionTypes.SET_PRODUCT_TO_SHOW,
    payload: {
      productId,
      productSlug,
      source,
      sourceCode,
      warehouse,
      originLayout: layout,
      campaign,
      page,
      section,
      position,
      sectionPosition,
    },
  }
}

export function cleanProductModalProduct() {
  return {
    type: actionTypes.CLEAN_PRODUCT_TO_SHOW,
    payload: {},
  }
}

export const setEditingOrderMode = () => ({
  type: actionTypes.SET_EDITING_ORDER_MODE,
})

export const unsetEditingOrderMode = () => ({
  type: actionTypes.UNSET_EDITING_ORDER_MODE,
})

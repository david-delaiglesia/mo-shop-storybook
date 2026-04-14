export const actionTypes = {
  OPEN_DELIVERY_AREA_MODAL: 'OPEN_DELIVERY_AREA_MODAL',
  CLOSE_DELIVERY_AREA_MODAL: 'CLOSE_DELIVERY_AREA_MODAL',
}

export const openDeliveryArea = () => ({
  type: actionTypes.OPEN_DELIVERY_AREA_MODAL,
})

export const closeDeliveryArea = () => ({
  type: actionTypes.CLOSE_DELIVERY_AREA_MODAL,
})

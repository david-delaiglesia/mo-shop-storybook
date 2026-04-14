export const SAVE_MAXIMUM_WATER_LITERS_FOR_CART_ORDER =
  'SAVE_MAXIMUM_WATER_LITERS_FOR_CART_ORDER'

export const saveMaximumWaterLitersForCartOrder = (waterLimit) => {
  return {
    type: SAVE_MAXIMUM_WATER_LITERS_FOR_CART_ORDER,
    payload: { waterLimit },
  }
}

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { saveMaximumWaterLitersForCartOrder as saveMaximumWaterLitersForCartOrderAction } from 'app/config/actions'
import { useVariant } from 'services/feature-flags'
import { variants } from 'services/feature-flags/constants'
import { constants } from 'utils/constants'

export const ConfigProvider = () => {
  const dispatch = useDispatch()

  const variant = useVariant(variants.MAXIMUM_WATER_LITERS)

  const saveMaximumWaterLitersForCartOrder = async () => {
    if (variant?.enabled) {
      const variantWaterLimit = variant.payload.value
      const waterLimit = variantWaterLimit
        ? variantWaterLimit
        : constants.MAX_WATER_LITERS

      const action = saveMaximumWaterLitersForCartOrderAction(waterLimit)
      dispatch(action)
      return
    }

    const action = saveMaximumWaterLitersForCartOrderAction(
      constants.MAX_WATER_LITERS,
    )
    dispatch(action)
  }

  useEffect(() => {
    saveMaximumWaterLitersForCartOrder()
  }, [variant])

  return null
}

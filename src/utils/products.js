import { Product } from '../domain/product'
import { getLocaleStringValue } from './maths'
import { packsPluralizer, unitsPluralizer } from './pluralizers'

import { I18nClient } from 'app/i18n/client'

export const DETAIL_THEME = 'detail'
export const GRID_THEME = 'grid'
export const CART_THEME = 'cart'

const reducedBulkMeasure = { kg: 'g', l: 'ml' }

function getReducedQuantity(quantity) {
  const reducedQuantity = quantity * 1000
  return getLocaleStringValue(reducedQuantity, 0)
}

export function applyCurrentMeasure(quantity, size_format, approx_size) {
  const approx = approx_size
    ? ` ${I18nClient.t('approximate_value_field')}`
    : ''

  if (quantity < 1) {
    const convertedQuantity = getReducedQuantity(quantity)
    return `${convertedQuantity} ${reducedBulkMeasure[size_format]}${approx}`
  }

  const bulkMeasure = { ud: I18nClient.t('unit_field'), l: 'L' }
  const formattedQuantity = getLocaleStringValue(quantity, 0)

  return `${formattedQuantity} ${
    bulkMeasure[size_format] || size_format
  }${approx}`
}

export function getFeedbackText(quantity, product) {
  if (Product.isPack(product)) {
    return `${quantity} ${packsPluralizer(quantity)}`
  }

  if (Product.isBulk(product)) {
    return applyCurrentMeasure(quantity, product.price_instructions.size_format)
  }

  return `${quantity} ${unitsPluralizer(quantity)}`
}

const unitsFormat = ({ is_pack }) =>
  is_pack ? I18nClient.t('pack_field') : I18nClient.t('unit_field')

export const getProductPriceSizeFormat = (
  { min_bunch_amount, size_format, is_pack },
  isProductBulk,
) => {
  if (isProductBulk) {
    return ` /${applyCurrentMeasure(min_bunch_amount, size_format)}`
  }
  return ` /${unitsFormat({ is_pack })}`
}

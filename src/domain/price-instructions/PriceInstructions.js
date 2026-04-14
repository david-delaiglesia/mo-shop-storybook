import { SELLING_METHOD, SIZE_FORMAT_BY_UNITS } from './constants'

function isPack(price) {
  return price.is_pack
}

function isBulk(price) {
  return getSellingMethod(price) === SELLING_METHOD.BULK
}

function getPrice(price) {
  if (isBulk(price)) {
    return localizePrice(price.min_bunch_amount * price.bulk_price)
  }

  return localizePrice(price.unit_price)
}

function localizePrice(price) {
  return parseFloat(price).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getSellingMethod(price) {
  return price.selling_method
}

function getSize(price) {
  return price.unit_size
}

function hasOnlyOneUnit(price) {
  return price.unit_size === 1
}

function isSizeFormatByUnits(price) {
  return price.size_format === SIZE_FORMAT_BY_UNITS
}

function getRawPrice(price) {
  if (isBulk(price)) {
    return parseFloat(price.min_bunch_amount * price.bulk_price)
  }

  return parseFloat(price.unit_price)
}

function getPreviousPrice(price) {
  return price.previous_unit_price && localizePrice(price.previous_unit_price)
}

export const PriceInstructions = {
  getSize,
  getPrice,
  getRawPrice,
  isBulk,
  isPack,
  getSellingMethod,
  hasOnlyOneUnit,
  isSizeFormatByUnits,
  getPreviousPrice,
}

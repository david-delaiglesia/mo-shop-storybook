import { getDay, getToday, isEqualOrGreater } from '../../utils/dates'
import { Badges } from './Badges'

import { I18nClient } from 'app/i18n/client'
import { PriceInstructions } from 'domain/price-instructions'
import { applyCurrentMeasure } from 'utils/products'

const TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable'

function isPack(product) {
  const price = product.price_instructions

  return PriceInstructions.isPack(price)
}

function hasToShowPackaging(product) {
  return !isPack(product) && !!product.packaging
}

function isBulk(product) {
  const price = product.price_instructions

  return PriceInstructions.isBulk(price)
}

function getId(product) {
  return product.id
}

function getPrice(product) {
  const price = product.price_instructions

  return PriceInstructions.getPrice(price)
}

function getRawPrice(product) {
  const price = product.price_instructions

  return PriceInstructions.getRawPrice(price)
}

function getSize(product) {
  const price = product.price_instructions

  return PriceInstructions.getSize(price)
}

function getSellingMethod(product) {
  const price = product.price_instructions

  return PriceInstructions.getSellingMethod(price)
}

function getCategory(product) {
  return product.categories[0]
}

function isWater(product) {
  return Badges.isWater(product.badges)
}

function hasToShowSizeFromEachUnit(product) {
  const price = product.price_instructions

  return !(
    PriceInstructions.hasOnlyOneUnit(price) &&
    PriceInstructions.isSizeFormatByUnits(price)
  )
}

function hasValidUnavailableFrom(product, selectedSlotDay) {
  return (
    product?.unavailable_from &&
    isEqualOrGreater(getDay(product.unavailable_from), getToday()) &&
    isEqualOrGreater(selectedSlotDay, getDay(product.unavailable_from))
  )
}

function hasValidUnavailableWeekdays(product, selectedDayNumber) {
  return (
    product.unavailable_weekdays?.length > 0 &&
    product.unavailable_weekdays?.includes(selectedDayNumber)
  )
}

const isPublished = (product) => {
  if (!product) return false

  return product.published
}

const isOutOfStock = (product) => {
  if (!product) return false

  return product.status === TEMPORARILY_UNAVAILABLE
}

const getSerializedPriceFrom = ({
  price_instructions: {
    total_units: totalUnits,
    unit_size: unitSize,
    size_format: sizeFormat,
    approx_size: approxSize,
    drained_weight: drainedWeight,
    min_bunch_amount: minBunchAmount,
    unit_name: unitName,
    pack_size: packSize,
  },
}) => ({
  totalUnits,
  unitSize,
  sizeFormat,
  approxSize,
  drainedWeight,
  minBunchAmount,
  unitName,
  packSize,
})

const getSizeFormat = (product) => {
  const price = getSerializedPriceFrom(product)

  if (Product.isBulk(product)) return getSizeFormatFromBulkProduct(product)
  if (price.totalUnits) return getSizeFormatFromProductWithTotalUnits(product)
  if (price.unitSize) return getSizeFormatFromProductWithUnitSize(product)
  if (price.drainedWeight)
    return getSizeFormatFromProductWithDrainedWeight(product)
}

const getSizeFormatFromBulkProduct = (product) => {
  const price = getSerializedPriceFrom(product)

  return applyCurrentMeasure(
    price.minBunchAmount,
    price.sizeFormat,
    price.approxSize,
  )
}

const getSizeFormatFromProductWithTotalUnits = (product) => {
  const price = getSerializedPriceFrom(product)
  const size = `${price.totalUnits} ${price.unitName}`

  if (Product.isPack(product)) {
    const packSize = applyCurrentMeasure(price.packSize, price.sizeFormat)

    if (price.drainedWeight) {
      const drainedField = I18nClient.t('drained_field')

      const unitSize = applyCurrentMeasure(
        price.unitSize / price.totalUnits,
        price.sizeFormat,
        price.approxSize,
      )

      return `${size} x ${unitSize} (${packSize} ${drainedField})`
    }

    return `${size} x ${packSize}`
  }

  if (price.drainedWeight && !price.unitSize) {
    const drainedField = I18nClient.t('drained_field')
    const drainedWeight = applyCurrentMeasure(
      price.drainedWeight,
      price.sizeFormat,
    ).trim()

    return `${size} (${drainedWeight} ${drainedField})`
  }

  if (Product.hasToShowSizeFromEachUnit(product)) {
    const unitSize = applyCurrentMeasure(
      price.unitSize,
      price.sizeFormat,
      price.approxSize,
    )

    return `${size} (${unitSize})`
  }

  return size
}

const getSizeFormatFromProductWithDrainedWeight = (product) => {
  const price = getSerializedPriceFrom(product)
  const drainedField = I18nClient.t('drained_field')
  const drainedWeightWithApprox = applyCurrentMeasure(
    price.drainedWeight,
    price.sizeFormat,
    price.approxSize,
  )

  return `${drainedWeightWithApprox} ${drainedField}`
}

const getSizeFormatFromProductWithUnitSize = (product) => {
  const price = getSerializedPriceFrom(product)
  const drainedField = I18nClient.t('drained_field')
  const size = applyCurrentMeasure(
    price.unitSize,
    price.sizeFormat,
    price.approxSize,
  )

  if (!price.drainedWeight) return size
  const drainedWeight = applyCurrentMeasure(
    price.drainedWeight,
    price.sizeFormat,
  )

  return `${size} (${drainedWeight} ${drainedField})`
}

export const Product = {
  isPack,
  isBulk,
  getPrice,
  getRawPrice,
  getId,
  isWater,
  getSize,
  getSellingMethod,
  getCategory,
  hasToShowPackaging,
  hasToShowSizeFromEachUnit,
  hasValidUnavailableFrom,
  hasValidUnavailableWeekdays,
  isPublished,
  isOutOfStock,
  getSizeFormat,
}

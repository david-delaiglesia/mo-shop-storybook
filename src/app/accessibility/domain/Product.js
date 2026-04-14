import { I18nClient } from 'app/i18n/client'
import { PriceInstructions } from 'domain/price-instructions'
import { Product } from 'domain/product'
import { applyCurrentMeasure, getFeedbackText } from 'utils/products'
import { capitalizeFirstLetter } from 'utils/strings'

export const getAriaLabelForProductBreadcrumb = (subCategory) => {
  return I18nClient.t('accessibility.go_to_category', { subCategory })
}

export const getAriaLabelForApproximatePrice = (price) => {
  return I18nClient.t('accessibility.cart_approximated_total', { price })
}

export const getAriaLabelForCartQuantity = (text) => {
  const accessibleText = getProductAccessibleText(text)
  return `${accessibleText} ${I18nClient.t('accessibility.in_the_cart')}`
}

export const getAriaLabelForUnpublishedProductAlternatives = (
  product,
  alternativesCount,
) => {
  const alternativesSingular = I18nClient.t(
    'accessibility.alternatives_pluralized_singular',
  )
  const alternativesPlural = I18nClient.t(
    'accessibility.alternatives_pluralized_plural',
  )
  const alternativesPluralized =
    alternativesCount === 1 ? alternativesSingular : alternativesPlural

  return I18nClient.t('accessibility.product_alternatives', {
    count: alternativesCount,
    alternativesPluralized,
    product: product.display_name,
    format: getAccessibleProductFormat(product),
  })
}

export const getAriaLabelForUnpublishedProduct = (product) => {
  const productAriaLabel = getAriaLabelForProductCell(product)

  return `${productAriaLabel}, ${Product.isOutOfStock(product) ? I18nClient.t('out_of_stock.message') : I18nClient.t('unpublished_cell_title')}`
}

export const getAriaLabelForProductPrice = (priceInstructions) => {
  const previousPrice = PriceInstructions.getPreviousPrice(priceInstructions)
  const productFormat = getProductFormat(priceInstructions)

  const price = PriceInstructions.getPrice(priceInstructions)
  const priceDescription = I18nClient.t('accessibility.price_per_unit', {
    price: price,
    unit: productFormat,
  })
  const priceDescriptionWithPreviousPrice = I18nClient.t(
    'accessibility.price_drops_per_unit',
    { previousPrice: previousPrice, price: price, unit: productFormat },
  )

  const priceLabel = previousPrice
    ? priceDescriptionWithPreviousPrice
    : priceDescription

  return priceLabel
}

const getAccessibleProductFormat = (product) => {
  const size = Product.getSizeFormat(product)
  const accessibleUnit = getProductAccessibleText(size)
  const hasToShowPackaging = Product.hasToShowPackaging(product)

  const packagingLabel = hasToShowPackaging
    ? `, ${capitalizeFirstLetter(product.packaging)}`
    : ''

  return `${packagingLabel}, ${accessibleUnit}`
}

export const getAriaLabelForProductCell = (product) => {
  const { display_name, published, price_instructions } = product

  const productFormat = getAccessibleProductFormat(product)

  const productLabel = `${display_name}${productFormat}`

  if (published) {
    const priceLabel = getAriaLabelForProductPrice(price_instructions)

    return `${productLabel}, ${priceLabel}`
  }

  return productLabel
}

export const getAccessibleUnitForAddOrRemoveProduct = (priceInstructions) => {
  const productFormat = getProductFormat(priceInstructions)

  const isProductUnit = productFormat.includes(
    I18nClient.t('accessibility.unit'),
  )
  const isProductUnitOrPack = priceInstructions.is_pack || isProductUnit
  return `${isProductUnitOrPack ? '1 ' : ''}${productFormat}`
}

export const getAriaLabelForRemoveProductFromCart = (
  quantity,
  priceInstructions,
) => {
  if (quantity === 1) {
    return I18nClient.t('accessibility.remove_product_from_cart')
  }

  const accessibleUnit =
    getAccessibleUnitForAddOrRemoveProduct(priceInstructions)

  return I18nClient.t('accessibility.remove_unit_from_cart', {
    unit: accessibleUnit,
  })
}

export const getAriaLabelForAddingUnitToCart = (priceInstructions) => {
  const accessibleUnit =
    getAccessibleUnitForAddOrRemoveProduct(priceInstructions)

  return I18nClient.t('accessibility.add_unit_to_cart', {
    unit: accessibleUnit,
  })
}

const pluralizeUnit = (unit, productDescriptionWords) => {
  const unitPosition = productDescriptionWords.indexOf(unit)
  const unitAmount =
    unitPosition > 0 ? productDescriptionWords[unitPosition - 1] : '0'

  const unitAmountLocalized = unitAmount.replace(',', '.')

  return parseFloat(unitAmountLocalized) > 1 ? `${unit}s` : unit
}

export const getProductAccessibleText = (text) => {
  if (!text) {
    return ''
  }

  const unitMap = {
    kg: I18nClient.t('accessibility.kg'),
    g: I18nClient.t('accessibility.g'),
    L: I18nClient.t('accessibility.l'),
    ml: I18nClient.t('accessibility.ml'),
    kgs: I18nClient.t('accessibility.kgs'),
    gs: I18nClient.t('accessibility.gs'),
    Ls: I18nClient.t('accessibility.ls'),
    mls: I18nClient.t('accessibility.mls'),
    'ud.': I18nClient.t('accessibility.unit'),
    'ud.s': I18nClient.t('accessibility.units'),
    'uds.': I18nClient.t('accessibility.units'),
    'uds.s': I18nClient.t('accessibility.units'),
    'u.': I18nClient.t('accessibility.unit'),
    'u.s': I18nClient.t('accessibility.units'),
    '€/L': `€/${I18nClient.t('accessibility.l')}`,
  }

  const productDescriptionWords = text.split(' ')

  const accessibleDescription = []

  productDescriptionWords.forEach((word) => {
    const isUnit = unitMap[word]

    if (!isUnit) {
      accessibleDescription.push(word)

      return
    }

    const unit = pluralizeUnit(word, productDescriptionWords)
    const accessibleUnit = unitMap[unit]

    accessibleDescription.push(accessibleUnit)
  })

  return `${accessibleDescription.join(' ')}`
}

export const getProductFormat = (priceInstructions) => {
  if (!priceInstructions) {
    return ''
  }

  const isProductBulk = PriceInstructions.isBulk(priceInstructions)

  if (isProductBulk) {
    const text = applyCurrentMeasure(
      priceInstructions.min_bunch_amount,
      priceInstructions.size_format,
    )
    return getProductAccessibleText(text)
  }

  if (priceInstructions.is_pack) {
    return I18nClient.t('accessibility.pack')
  }

  return I18nClient.t('accessibility.unit')
}

export const getProductAddedFeedback = (quantity, product) => {
  const quantifiedUnit = getFeedbackText(quantity, product)

  const [accessibleQuantity = ''] = quantifiedUnit?.split(' ') || []

  if (parseFloat(accessibleQuantity) !== 1) {
    return I18nClient.t('accessibility.product_added_feedback', {
      pluralizedAction: I18nClient.t('accessibility.pluralized_action_plural'),
      unit: getProductAccessibleText(quantifiedUnit),
    })
  }

  return I18nClient.t('accessibility.product_added_feedback', {
    pluralizedAction: I18nClient.t('accessibility.pluralized_action_singular'),
    unit: getProductAccessibleText(quantifiedUnit),
  })
}

export const getProductDecreasedFeedback = (quantity, product) => {
  const quantifiedUnit = getFeedbackText(quantity, product)

  const accessibleQuantity = quantifiedUnit?.split(' ') || ''
  const isPlural = parseFloat(accessibleQuantity) > 1

  if (isPlural) {
    return I18nClient.t('accessibility.product_removed_feedback', {
      pluralizedAction: I18nClient.t('accessibility.pluralized_action_plural'),
      unit: getProductAccessibleText(quantifiedUnit),
    })
  }

  return I18nClient.t('accessibility.product_removed_feedback', {
    pluralizedAction: I18nClient.t('accessibility.pluralized_action_singular'),
    unit: getProductAccessibleText(quantifiedUnit),
  })
}

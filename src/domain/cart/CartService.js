import { Cart } from 'domain/cart'
import { PriceInstructions } from 'domain/price-instructions'
import { Product } from 'domain/product'
import { LocationService } from 'infra/LocationService'

function getWater(cart, products) {
  if (Cart.isEmpty(cart)) {
    return 0
  }

  const cartWithPublishedProducts = filterCartProductsByPublished(
    cart,
    products,
  )

  const orderLines = cartWithPublishedProducts.products
  const orderLinesKeys = Object.keys(orderLines)
  return orderLinesKeys
    .filter((orderLineId) => {
      const product = products[orderLineId]
      return Product.isWater(product)
    })
    .reduce((total, orderLineId) => {
      const product = products[orderLineId]
      const size = Product.getSize(product)
      return total + size * orderLines[orderLineId].quantity
    }, 0)
}

function canAddProduct({ cart, products, product, increment, waterLimit }) {
  if (!Product.isWater(product)) {
    return true
  }

  const size = Product.getSize(product)
  const orderLines = cart.products

  let incrementedWater = size
  if (increment && !orderLines[product.id]) {
    incrementedWater = size * increment
  }

  const currentCartWater = getWater(cart, products)
  const totalWater = currentCartWater + incrementedWater

  return totalWater <= waterLimit
}

function filterCartProductsByPublished(cart, products) {
  const cartProducts = cart.products

  const cartProductsWithPublishedValue = Object.keys(cartProducts).map(
    (productId) => ({
      ...cartProducts[productId],
      published: products[productId]?.published,
    }),
  )

  const cartProductFilteredByPublished = cartProductsWithPublishedValue.filter(
    (cartElement) => cartElement.published,
  )

  const cartProductFilteredByPublishedNormalized =
    cartProductFilteredByPublished.reduce((acc, currentCartElement) => {
      acc[currentCartElement.id] = currentCartElement
      return acc
    }, {})

  return { id: cart.id, products: cartProductFilteredByPublishedNormalized }
}

function filterCartProductsByUnpublished(cart, products) {
  const cartProducts = cart.products

  const cartProductsWithPublishedValue = Object.keys(cartProducts).map(
    (productId) => ({
      ...cartProducts[productId],
      published: products[productId]?.published,
    }),
  )

  const cartProductFilteredByUnpublished =
    cartProductsWithPublishedValue.filter(
      (cartElement) => !cartElement.published,
    )

  const cartProductFilterdByUnublishedNormalized =
    cartProductFilteredByUnpublished.reduce((acc, currentCartElement) => {
      acc[currentCartElement.id] = currentCartElement
      return acc
    }, {})

  return { id: cart.id, products: cartProductFilterdByUnublishedNormalized }
}

function getOrderLine(cart, id) {
  if (Cart.isEmpty(cart)) {
    return
  }

  return cart.products[id]
}

function getProductIds(cart) {
  return cart.products.map((line) => Product.getId(line.product))
}

function addBulkQuantity(product, quantity) {
  const {
    min_bunch_amount: minBunchAmount,
    increment_bunch_amount: incrementBunchAmount,
  } = product.price_instructions

  if (quantity === 0) {
    return minBunchAmount
  }

  return Math.round((quantity + incrementBunchAmount) * 100) / 100
}

function addQuantity(product, quantity = 0) {
  if (Product.isBulk(product)) {
    return addBulkQuantity(product, quantity)
  }

  return quantity + 1
}

function getQuantity(orderLine, product) {
  const isPathWithRecommendedQuantities =
    LocationService.isPathWithRecommendedQuantity()

  if (
    product.recommendedQuantity &&
    !orderLine &&
    isPathWithRecommendedQuantities
  ) {
    return product.recommendedQuantity
  }
  return addQuantity(product, orderLine?.quantity)
}

function calcTotal(priceInstructions, quantity) {
  const { bulk_price: bulkPrice, unit_price: unitPrice } = priceInstructions

  if (PriceInstructions.isBulk(priceInstructions)) {
    return Math.round(bulkPrice * quantity * 100) / 100
  }

  return Math.round(unitPrice * quantity * 100) / 100
}

function getOrderInCart(cart, product) {
  const orderLine = cart.products[product.id]

  if (product.shoppingListOrder) {
    return product.shoppingListOrder
  }

  if (orderLine) {
    return orderLine.order
  }

  return ++Object.keys(cart.products).length
}

function getSources(orderLine, sourceCode, product) {
  const savedSources = orderLine?.sources
  const initialSources = savedSources || []

  const addedMultipleTimesAtOnce = !orderLine && product.recommendedQuantity

  if (addedMultipleTimesAtOnce) {
    const addedQuantity = Math.ceil(
      product.recommendedQuantity /
        product.price_instructions.increment_bunch_amount,
    )
    const sourcesToAdd = Array.from({ length: addedQuantity }).map(
      () => sourceCode,
    )
    return [...initialSources, ...sourcesToAdd]
  }

  return [...initialSources, sourceCode]
}

function getSourcesForShoppingList(orderLine, sourceCode, product) {
  const savedSources = orderLine?.sources
  const initialSources = savedSources || []

  const cartQuantity = orderLine?.quantity || 0
  const newCartQuantity = getQuantityForShoppingList(orderLine, product)

  const addedQuantity = Math.ceil(
    (newCartQuantity - cartQuantity) /
      product.price_instructions.increment_bunch_amount,
  )

  const sourcesToAdd = Array.from({ length: addedQuantity }).map(
    () => sourceCode,
  )

  return [...initialSources, ...sourcesToAdd]
}

const getQuantityForShoppingList = (orderLine, product) => {
  const cartQuantity = orderLine?.quantity || 0
  const newCartQuantity =
    Math.round((cartQuantity + product.recommended_quantity) * 1000) / 1000

  if (newCartQuantity > product.limit) {
    return product.limit
  }

  return newCartQuantity
}

function formatProductToOrderLine(
  cart,
  product,
  sourceCode,
  isAddingWholeShoppingListToCart,
) {
  const orderLine = cart.products[product.id]
  const priceInstructions =
    orderLine?.priceInstructions || product.price_instructions
  const quantity = isAddingWholeShoppingListToCart
    ? getQuantityForShoppingList(orderLine, product)
    : getQuantity(orderLine, product)
  const total = calcTotal(priceInstructions, quantity)
  const order = getOrderInCart(cart, product)
  const { is_water, requires_age_check } = product.badges
  const sources = isAddingWholeShoppingListToCart
    ? getSourcesForShoppingList(orderLine, `+${sourceCode}`, product)
    : getSources(orderLine, `+${sourceCode}`, product)
  const id = product.id
  const orderLineId = orderLine?.orderLineId
  const published = product.published

  return {
    orderLineId,
    quantity,
    total,
    order,
    is_water,
    requires_age_check,
    id,
    priceInstructions,
    sources,
    published,
  }
}

function addProduct(
  cart,
  { product, sourceCode, isAddingWholeShoppingListToCart = false },
) {
  const cartProducts = cart.products
  const orderLine = formatProductToOrderLine(
    cart,
    product,
    sourceCode,
    isAddingWholeShoppingListToCart,
  )

  return {
    ...cart,
    products: {
      ...cartProducts,
      [orderLine.id]: orderLine,
    },
  }
}

function removeProduct(cart, product) {
  const cartProducts = cart.products

  const newCartProducts = Object.keys(cartProducts)
    .filter((productId) => productId.toString() !== product.id.toString())
    .reduce((acc, productId) => {
      acc[productId] = { ...cartProducts[productId] }
      return acc
    }, {})

  const newCart = {
    ...cart,
    products: newCartProducts,
  }

  return newCart
}

function decreaseBulkQuantity(product, quantity) {
  const {
    min_bunch_amount: minBunchAmount,
    increment_bunch_amount: incrementBunchAmount,
  } = product.price_instructions

  if (quantity === minBunchAmount) {
    return 0
  }

  const quantityAfterDecrease =
    Math.round((quantity - incrementBunchAmount) * 100) / 100
  if (quantityAfterDecrease < 0) {
    return 0
  }

  return quantityAfterDecrease
}

function decreaseQuantity(orderLine, product) {
  if (Product.isBulk(product)) {
    return decreaseBulkQuantity(product, orderLine.quantity)
  }

  return orderLine.quantity - 1
}

function decreaseProduct(cart, { product, sourceCode }) {
  const cartProducts = cart.products
  const orderLine = cart.products[product.id]
  const priceInstructions =
    orderLine?.priceInstructions || product.price_instructions
  if (!orderLine) {
    return cart
  }

  const quantity = decreaseQuantity(orderLine, product)
  const total = calcTotal(priceInstructions, quantity)
  const order = getOrderInCart(cart, product)
  const { is_water, requires_age_check } = product.badges
  const sources = getSources(orderLine, `-${sourceCode}`)
  const id = product.id
  const published = product.published

  if (quantity === 0) {
    return removeProduct(cart, product)
  }

  return {
    ...cart,
    products: {
      ...cartProducts,
      [id]: {
        orderLineId: orderLine?.orderLineId,
        quantity,
        total,
        order,
        is_water,
        requires_age_check,
        id,
        priceInstructions,
        sources,
        published,
      },
    },
  }
}

function getExceededProducts(cart) {
  return cart.products.filter(
    ({ quantity, product }) => quantity > product.limit,
  )
}

function getCartWithoutExceededProducts(cart) {
  const products = cart.products.map((cartProduct) => {
    const { quantity, product } = cartProduct
    if (quantity > product.limit) {
      return {
        ...cartProduct,
        quantity: product.limit,
      }
    }
    return cartProduct
  })
  return {
    ...cart,
    products,
  }
}

function getAddedUnitsToOngoingOrder(cart, mergedCart) {
  const cartTotalUnits = Cart.getTotalUnits(cart)
  const exceededProducts = mergedCart.products.filter(
    ({ quantity, product }) => quantity > product.limit,
  )
  const exceededProductsUnits = exceededProducts.map(
    ({ quantity, product }) => quantity - product.limit,
  )
  const exceededTotalUnits = exceededProductsUnits.reduce(
    (sum, quantity) => sum + quantity,
    0,
  )

  const unitsToAdd = cartTotalUnits - exceededTotalUnits
  return unitsToAdd
}

function areDifferent(cartA, cartB) {
  if (cartA.id !== cartB.id) return true

  if (Cart.getTotal(cartA) !== Cart.getTotal(cartB)) return true

  if (Cart.getTotalUnits(cartA) !== Cart.getTotalUnits(cartB)) return true

  return false
}

function isUpdated(previousCart, newCart = {}) {
  return (previousCart.version || 0) < newCart.version
}

function getItemsCount(cart) {
  return Object.values(cart.products).reduce((itemsCount, product) => {
    return product.quantity + itemsCount
  }, 0)
}

function groupOrderLinesByCategory(cart, products) {
  const orderLines = Cart.orderLines(cart, products)
  const orderLinesWithCategory = orderLines.map((orderLine) => {
    return {
      ...orderLine,
      category: Product.getCategory(products[orderLine.id]),
    }
  })
  const categories = new Set(
    orderLinesWithCategory.map(({ category }) => category.name),
  )

  return [...categories].sort().map((categoryName) => ({
    title: categoryName,
    orderLines: orderLinesWithCategory
      .filter(({ category }) => category.name === categoryName)
      .map(({ ...orderLine }) => orderLine),
  }))
}

export const CartService = {
  addProduct,
  removeProduct,
  decreaseProduct,
  getWater,
  getOrderLine,
  getProductIds,
  canAddProduct,
  filterCartProductsByPublished,
  filterCartProductsByUnpublished,
  calcTotal,
  formatProductToOrderLine,
  getExceededProducts,
  getCartWithoutExceededProducts,
  getAddedUnitsToOngoingOrder,
  areDifferent,
  isUpdated,
  getItemsCount,
  groupOrderLinesByCategory,
}

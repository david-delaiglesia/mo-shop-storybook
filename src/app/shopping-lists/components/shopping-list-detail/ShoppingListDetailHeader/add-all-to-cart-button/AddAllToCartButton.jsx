import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useStore } from 'react-redux'
import { useSelector } from 'react-redux'

import { ActionButton } from '../action-button'
import { monitoring } from 'monitoring'
import { object } from 'prop-types'

import { MediumModal } from '@mercadona/mo.library.shop-ui/modal'

import orderEditedImage from 'app/assets/order-edited@2x.png'
import { useUserUUID } from 'app/authentication'
import { CartClient } from 'app/cart/client'
import { saveCart } from 'app/cart/commands'
import { getCart } from 'app/cart/selectors'
import { SOURCE_CODES } from 'app/catalog/metrics'
import { LocalStateClient } from 'app/shopping-lists/infra/local-state-client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { PriceInstructions } from 'domain/price-instructions'
import { NetworkError } from 'services/http'
import { ListsCart } from 'system-ui/icons'

export const AddAllToCartButton = ({ listDetail }) => {
  const { t } = useTranslation()

  const cart = useSelector(getCart)
  const dispatch = useDispatch()
  const store = useStore()
  const userId = useUserUUID()

  const [displayConfirmationDialog, setDisplayConfirmationDialog] =
    useState(false)
  const [addedProductsNumber, setAddedProductsNumber] = useState(0)

  const parseItemToProduct = (item) => {
    return {
      ...item.product,
      recommended_quantity: item.recommended_quantity,
    }
  }

  const calculateProductAddedQuantity = (products) => {
    let productCount = 0

    products.forEach((product) => {
      const productInCartQuantity = cart?.products?.[product.id]?.quantity || 0
      const maxAllowedQuantity = product.limit - productInCartQuantity
      const isBulkProduct = PriceInstructions.isBulk(product.price_instructions)

      if (maxAllowedQuantity <= 0) return

      if (isBulkProduct) {
        productCount = productCount + 1
        return
      }

      if (product.recommended_quantity > maxAllowedQuantity) {
        productCount = productCount + maxAllowedQuantity
        return
      }

      productCount = productCount + product.recommended_quantity
      return
    })

    return productCount
  }

  const addListToCart = async () => {
    const products = listDetail.items.map(parseItemToProduct)

    ShoppingListsMetrics.clickOnAddListToCart(products, listDetail, cart)

    const productsAddedQuantity = calculateProductAddedQuantity(products)
    setAddedProductsNumber(productsAddedQuantity)

    const updatedLocalCart = await LocalStateClient.updateCart(
      {
        products,
        sourceCode: SOURCE_CODES.SHOPPING_LIST,
      },
      dispatch,
    )

    try {
      const updatedCart = await CartClient.updateCartFromShoppingList(
        userId,
        updatedLocalCart,
      )

      saveCart(updatedCart, store)
      updatedLocalCart.version = updatedCart?.version || 0
      setDisplayConfirmationDialog(true)

      ShoppingListsMetrics.addAllToCartCompleted(
        cart,
        updatedLocalCart,
        listDetail,
      )
    } catch (error) {
      monitoring.captureError(
        new Error('Failed to send the cart to the backend'),
      )
      NetworkError.publish(error)
    }
  }

  const productsAddedTranslation =
    addedProductsNumber !== 1
      ? 'shopping_lists.success_dialog.title_plural'
      : 'shopping_lists.success_dialog.title'

  return (
    <>
      <ActionButton
        label={t('shopping_lists.header_actions.add_all_to_cart')}
        icon={ListsCart}
        onClick={addListToCart}
      />
      {displayConfirmationDialog && (
        <MediumModal
          title={`${addedProductsNumber} ${t(productsAddedTranslation)}`}
          imageSrc={orderEditedImage}
          primaryActionText={t('shopping_lists.success_dialog.accept_button')}
          primaryAction={() => {
            setDisplayConfirmationDialog(false)
          }}
          hideModal={() => null}
        />
      )}
    </>
  )
}

AddAllToCartButton.propTypes = {
  listDetail: object,
}

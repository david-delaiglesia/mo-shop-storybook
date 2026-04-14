import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { getCart } from 'app/cart/selectors'
import { Cart } from 'domain/cart'

import './CartItemRemoved.css'

export const CartItemRemoved = () => {
  const { t } = useTranslation()

  const cart = useSelector(getCart)

  const items = Cart.getItemsQuantity(cart)

  const [updatedText, setUpdatedText] = useState('')

  const [prevItems, setPrevItems] = useState(items)

  const itemRemovedText = t('accessibility.product_removed_from_cart_feedback')
  const emptyCartText = t('accessibility.empty_cart_feedback')

  const isCartEmpty = Cart.isEmpty(cart)

  const announceItemRemoved = (
    items: number,
    prevItems: number,
    updatedText: string,
  ) => {
    if (items < prevItems) {
      const alternateText = updatedText?.includes('.') ? '' : '.'

      setUpdatedText(`${itemRemovedText}${alternateText}`)
    }
  }

  const announceCartEmpty = () => {
    const timeToWaitForOtherAnnouncementsToEnd = 2000

    if (isCartEmpty) {
      setTimeout(() => {
        setUpdatedText(emptyCartText)
      }, timeToWaitForOtherAnnouncementsToEnd)
    }
  }

  useEffect(() => {
    announceItemRemoved(items, prevItems, updatedText)
    announceCartEmpty()

    setPrevItems(items)
  }, [prevItems, items, updatedText])

  return (
    <div
      aria-live="polite"
      className="cart-item-removed__accessibility-feedback-container"
    >
      {updatedText}
    </div>
  )
}

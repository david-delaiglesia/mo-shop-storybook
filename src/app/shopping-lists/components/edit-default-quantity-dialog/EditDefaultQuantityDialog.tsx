import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { func, object } from 'prop-types'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import {
  getAccessibleUnitForAddOrRemoveProduct,
  getProductAccessibleText,
} from 'app/accessibility'
import { useUserUUID } from 'app/authentication'
import { ProductQuantityChangedAccessibilityFeedback } from 'app/catalog/components/product-quantity-changed-accessibility-feedback'
import { Product } from 'app/products'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import ButtonV2 from 'components/button'
import { ModalInfoPortal } from 'components/modal-info'
import { TAB_INDEX } from 'utils/constants'
import { getFeedbackText } from 'utils/products'

import './EditDefaultQuantityDialog.css'

interface EditDefaultQuantityDialogProps {
  product: Product
  onEditQuantityDialogVisible: (value: boolean) => void
}
const EditDefaultQuantityDialog = ({
  product,
  onEditQuantityDialogVisible,
}: EditDefaultQuantityDialogProps) => {
  const { t } = useTranslation()
  const userId = useUserUUID()
  const { listId } = useParams<{ listId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const { reFetchListDetail, listName } = useShoppingListsContext()

  const {
    min_bunch_amount: minimumQuantity,
    increment_bunch_amount: incrementalQuantity,
  } = product.price_instructions

  const [quantity, setQuantity] = useState(product.recommendedQuantity!)
  const [productQuantityChangedFeedback, setProductQuantityChangedFeedback] =
    useState('')

  const eventPayload = [listId, listName, product.id, product.display_name]

  const handleDismissModal = () => {
    onEditQuantityDialogVisible(false)
    ShoppingListsMetrics.clickOnCancelEditRecommendedQuantity(
      ...eventPayload,
      quantity,
    )
  }

  const handleSaveRecommendedQuantity = async () => {
    setIsLoading(true)
    await ShoppingListsClient.saveRecommendedQuantity(
      userId,
      listId,
      product.id,
      quantity,
    )
    reFetchListDetail()
    setIsLoading(false)
    ShoppingListsMetrics.clickOnSaveRecommendedQuantity(
      ...eventPayload,
      product.recommendedQuantity,
      quantity,
    )
    onEditQuantityDialogVisible(false)
  }

  const productDisplayName = product.display_name

  const feedbackText = getFeedbackText(quantity, product)
  const productQuantity = getProductAccessibleText(feedbackText)
  const productInList = t('shopping_lists.list_item.in_list')

  const editDefaultQuantityAriaLabel = `${productDisplayName},
   ${productQuantity} ${productInList}`

  const quantityWithFormat = getAccessibleUnitForAddOrRemoveProduct(
    product.price_instructions,
  )

  const increaseQuantityAriaLabel = t('accessibility.increase_quantity', {
    quantityWithFormat,
  })
  const decreaseQuantityAriaLabel = t('accessibility.decrease_quantity', {
    quantityWithFormat,
  })
  const productDecreasedFeedback = t(
    'accessibility.decrease_quantity_feedback',
    {
      quantityWithFormat,
    },
  )
  const productIncreasedFeedback = t(
    'accessibility.increase_quantity_feedback',
    {
      quantityWithFormat,
    },
  )

  return (
    <ModalInfoPortal>
      <Modal
        size={ModalSize.MEDIUM}
        title={t('shopping_lists.more_actions.edit_quantity')}
        primaryActionLoading={isLoading}
        onClose={handleDismissModal}
        primaryActionText={t('button.save_changes')}
        onPrimaryAction={handleSaveRecommendedQuantity}
        secondaryActionText={t('button.cancel')}
        onSecondaryAction={handleDismissModal}
      >
        <ProductQuantityChangedAccessibilityFeedback
          text={productQuantityChangedFeedback}
          quantity={quantity}
        />
        <div
          tabIndex={TAB_INDEX.ENABLED}
          className="edit-default-quantity-dialog__product"
          aria-label={editDefaultQuantityAriaLabel}
        >
          <img
            alt=""
            className="edit-default-quantity-dialog__product-image"
            src={product.thumbnail}
          />
          <div className="edit-default-quantity-dialog__product-info">
            <p className="body1-r edit-default-quantity-dialog__product-name">
              {product.display_name}
            </p>
            <div className="edit-default-quantity-dialog__price-instructions">
              <p
                className="title2-b"
                aria-label={getProductAccessibleText(feedbackText)}
              >
                {feedbackText}
              </p>
              <div className="edit-default-quantity-dialog__quantity-controls">
                <ButtonV2
                  disabled={quantity <= minimumQuantity}
                  icon="minus-28"
                  type="oval"
                  className="edit-default-quantity-dialog__quantity-button"
                  ariaLabel={decreaseQuantityAriaLabel}
                  onClick={() =>
                    setQuantity((prevQuantity: number) => {
                      const newQuantity = prevQuantity - incrementalQuantity
                      const newQunatityRounded = parseFloat(
                        newQuantity.toFixed(3),
                      )
                      ShoppingListsMetrics.clickOnDecreaseRecommendedQuantity(
                        ...eventPayload,
                        prevQuantity,
                        newQunatityRounded,
                      )

                      setProductQuantityChangedFeedback(
                        productDecreasedFeedback,
                      )
                      return newQunatityRounded
                    })
                  }
                />
                <ButtonV2
                  disabled={product.limit < quantity + incrementalQuantity}
                  icon="plus-28"
                  type="oval"
                  className="edit-default-quantity-dialog__quantity-button"
                  ariaLabel={increaseQuantityAriaLabel}
                  onClick={() =>
                    setQuantity((prevQuantity: number) => {
                      const newQuantity = prevQuantity + incrementalQuantity
                      const newQunatityRounded = parseFloat(
                        newQuantity.toFixed(3),
                      )
                      ShoppingListsMetrics.clickOnIncreaseRecommendedQuantity(
                        ...eventPayload,
                        prevQuantity,
                        newQunatityRounded,
                      )
                      setProductQuantityChangedFeedback(
                        productIncreasedFeedback,
                      )

                      return newQunatityRounded
                    })
                  }
                />
              </div>
            </div>
          </div>
          <span className="edit-default-quantity-dialog__product-overlay"></span>
        </div>
      </Modal>
    </ModalInfoPortal>
  )
}

EditDefaultQuantityDialog.propTypes = {
  product: object,
  setEditQuantityDialogVisible: func,
}

export { EditDefaultQuantityDialog }

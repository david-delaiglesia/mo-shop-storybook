import { useEffect, useState } from 'react'

import { PlusIcon20 } from './PlusIcon20'
import { ShoppingListsDialogCardItem } from './shopping-lists-dialog-card-item'
import { func, string } from 'prop-types'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { LAYOUTS } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ShoppingListsErrorDialog } from 'app/shopping-lists/components/shopping-lists-error-dialog'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import Modal from 'components/modal'
import { CloseModalButton } from 'system-ui/close-modal-button'

import './SelectShoppingListDialog.css'

const SelectShoppingListDialog = ({
  t,
  userId,
  productId,
  displaySelectShoppingListDialog,
  displayCreateShoppingListDialog,
}) => {
  const [productShoppingLists, setProductShoppingLists] = useState([])
  const [isErrorDialogVisible, displayErrorDialog] = useState(false)
  let isMounted = true
  const fetchProductShoppingLists = async () => {
    const response = await ShoppingListsClient.fetchProductShoppingLists(
      userId,
      productId,
    )

    if (isMounted) {
      setProductShoppingLists(response.shoppingLists)
    }
  }

  useEffect(() => {
    fetchProductShoppingLists()

    return () => {
      isMounted = false
    }
  }, [])

  const dialogTitle = t('shopping_lists.add_to_list.title')
  return (
    <div className="select-shopping-list-dialog__wrapper">
      <Modal ariaLabelModal={dialogTitle}>
        <div className="select-shopping-list-dialog__content">
          <div className="select-shopping-list-dialog__title title2-b">
            {dialogTitle}
          </div>
          <FocusedElementWithInitialFocus>
            <p className="select-shopping-list-dialog__description body1-r">
              {t('shopping_lists.add_to_list.description')}
            </p>
          </FocusedElementWithInitialFocus>
          <CloseModalButton
            onClick={() => displaySelectShoppingListDialog(false)}
          />
          <div className="select-shopping-list-dialog__card">
            <button
              className="select-shopping-list-dialog__card-item select-shopping-list-dialog__create-new-list-button body1-sb"
              onClick={() => {
                displayCreateShoppingListDialog(true)
                displaySelectShoppingListDialog(false)
                ShoppingListsMetrics.createNewListButtonClick(
                  LAYOUTS.PRODUCT_DETAIL,
                )
              }}
            >
              <div className="select-shopping-list-dialog__create-new-list-icon-wrapper">
                <div className="select-shopping-list-dialog__create-new-list-icon">
                  <PlusIcon20 />
                </div>
              </div>
              {t('shopping_lists.add_to_list.new_list')}
            </button>
            {productShoppingLists.map((list) => {
              return (
                <ShoppingListsDialogCardItem
                  key={list.id}
                  list={list}
                  productId={productId}
                  displaySelectShoppingListDialog={
                    displaySelectShoppingListDialog
                  }
                  displayErrorDialog={displayErrorDialog}
                />
              )
            })}
          </div>
        </div>
      </Modal>
      {isErrorDialogVisible && (
        <ShoppingListsErrorDialog
          message={t('shopping_lists.add_to_list.error_message')}
          closeDialog={() => displayErrorDialog(false)}
        />
      )}
    </div>
  )
}

SelectShoppingListDialog.propTypes = {
  t: func,
  userId: string,
  productId: string,
  displaySelectShoppingListDialog: func,
  displayCreateShoppingListDialog: func,
}

const SelectShoppingListDialogWithTranslate = withTranslate(
  SelectShoppingListDialog,
)

export { SelectShoppingListDialogWithTranslate as SelectShoppingListDialog }

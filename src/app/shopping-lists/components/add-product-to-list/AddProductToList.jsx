import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { func, string } from 'prop-types'

import { LAYOUTS } from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { CreateShoppingListDialog } from 'app/shopping-lists/components/create-shopping-list-dialog'
import { SelectShoppingListDialog } from 'app/shopping-lists/components/select-shopping-list-dialog'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { createNotification } from 'containers/notifications-container/actions'
import { ShoppingListIcon } from 'system-ui/icons'

import './AddProductToList.css'

const AddProductToList = ({ t, userId, productId }) => {
  const [isDialogVisible, displayDialog] = useState(false)
  const [isCreateShoppingListDialogVisible, displayCreateShoppingListDialog] =
    useState(false)
  const dispatch = useDispatch()

  const createShoppingListWithProduct = async (
    userId,
    listName,
    displayError,
  ) => {
    try {
      await ShoppingListsClient.createShoppingListWithProduct(
        userId,
        listName,
        productId,
      )
      displayCreateShoppingListDialog(false)
      ShoppingListsMetrics.saveNewListButtonClick(
        listName,
        LAYOUTS.PRODUCT_DETAIL,
      )

      dispatch(
        createNotification({
          text: `${t(`shopping_lists.add_to_list.notification`)} ${listName}`,
        }),
      )
    } catch {
      displayError()
    }
  }

  return (
    <>
      <div>
        {isDialogVisible && (
          <SelectShoppingListDialog
            userId={userId}
            productId={productId}
            displaySelectShoppingListDialog={displayDialog}
            displayCreateShoppingListDialog={displayCreateShoppingListDialog}
          />
        )}
        {isCreateShoppingListDialogVisible && (
          <CreateShoppingListDialog
            onCancel={() => displayCreateShoppingListDialog(false)}
            onCreate={createShoppingListWithProduct}
          />
        )}
      </div>
      <button
        onClick={() => {
          displayDialog(true)
          ShoppingListsMetrics.heartListIconClick(productId)
        }}
        className="add-product-to-list"
      >
        <ShoppingListIcon className="add-product-to-list__image" />
        <span className="subhead1-sb add-product-to-list__text">
          {t('shopping_lists.add_to_list.button_text')}
        </span>
      </button>
    </>
  )
}

AddProductToList.propTypes = {
  t: func,
  userId: string,
  productId: string,
}

const AddProductToListWithTranslate = withTranslate(AddProductToList)

export { AddProductToListWithTranslate as AddProductToList }

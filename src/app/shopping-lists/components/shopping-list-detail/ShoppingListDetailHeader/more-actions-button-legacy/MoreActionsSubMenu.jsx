import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { PropTypes } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'
import { SmallModal } from '@mercadona/mo.library.shop-ui/modal'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { ShoppingListsErrorDialog } from 'app/shopping-lists/components/shopping-lists-error-dialog'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import { PATHS } from 'pages/paths'
import { withClickOutside } from 'wrappers/click-out-handler'

import './MoreActionsButton.css'

const MoreActionsSubMenu = ({ hideMoreActionsSubMenu, t }) => {
  const history = useHistory()
  const userUuid = useSelector((state) => state?.session?.uuid)
  const { listId } = useParams()
  const [isConfirmationDialogVisible, displayConfirmationDialog] =
    useState(false)
  const [isErrorDialogVisible, displayErrorDialog] = useState(false)
  const { listName, productsQuantity } = useShoppingListsContext()

  const deleteShoppingList = async () => {
    try {
      await ShoppingListsClient.deleteShoppingList(userUuid, listId)
      history.push(PATHS.SHOPPING_LISTS)
      ShoppingListsMetrics.confirmDeleteShoppingListButtonClik(
        listName,
        listId,
        productsQuantity,
      )
    } catch {
      displayConfirmationDialog(false)
      displayErrorDialog(true)
    }
  }

  const cancelDeleteAction = () => {
    displayConfirmationDialog(false)
    hideMoreActionsSubMenu()
    ShoppingListsMetrics.cancelDeleteShoppingListButtonClick(
      listName,
      listId,
      productsQuantity,
    )
  }

  return (
    <>
      <button
        className="more-actions-button__sub-menu-legacy subhead1-r"
        onClick={() => {
          displayConfirmationDialog(true)
          ShoppingListsMetrics.deleteShoppingListButtonClick(
            listName,
            listId,
            productsQuantity,
          )
        }}
      >
        <div className="more-actions-button__sub-menu-option">
          <span className="more-actions-button__sub-menu-option-text">
            {t('shopping_lists.delete_list.delete_button_text')}
          </span>
          <span className="more-actions-button__sub-menu-option-icon">
            <Icon icon="delete" color="tomato" />
          </span>
        </div>
      </button>
      {isConfirmationDialogVisible && (
        <SmallModal
          title={t('shopping_lists.delete_list.dialog_title')}
          description={t('shopping_lists.delete_list.dialog_description')}
          primaryActionText={t(
            'shopping_lists.delete_list.dialog_primary_action_text',
          )}
          primaryAction={deleteShoppingList}
          secondaryActionText={t(
            'shopping_lists.delete_list.dialog_secondary_action_text',
          )}
          secondaryAction={cancelDeleteAction}
          mood="destructive"
          hideModal={cancelDeleteAction}
        />
      )}
      {isErrorDialogVisible && (
        <ShoppingListsErrorDialog
          message={t('shopping_lists.delete_list.error_message')}
          closeDialog={() => {
            displayErrorDialog(false)
          }}
        />
      )}
    </>
  )
}

MoreActionsSubMenu.propTypes = {
  hideMoreActionsSubMenu: PropTypes.func,
  t: PropTypes.func,
}

const MoreActionsSubMenuWithClickOut = withClickOutside(MoreActionsSubMenu)

const MoreActionsButtonWithTranslate = withTranslate(
  MoreActionsSubMenuWithClickOut,
)

export { MoreActionsButtonWithTranslate as MoreActionsSubMenu }

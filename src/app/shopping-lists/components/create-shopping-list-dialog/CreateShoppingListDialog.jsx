import { useState } from 'react'
import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ShoppingListsErrorDialog } from 'app/shopping-lists/components/shopping-lists-error-dialog'
import Input from 'system-ui/input'

import './CreateShoppingListDialog.css'

const CreateShoppingListDialog = ({ t, onCreate, onCancel }) => {
  const userUuid = useSelector((state) => state?.session?.uuid)
  const [listName, setListName] = useState('')
  const [isErrorDialogVisible, displayErrorDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const displayError = () => {
    setIsLoading(false)
    displayErrorDialog(true)
  }

  const dialogTitle = t('shopping_lists.create.title')

  const createShoppingList = async () => {
    setIsLoading(true)
    await onCreate(userUuid, listName, displayError)
  }

  const onListNameKeyDown = (event) => {
    const { key } = event

    if (key === 'Enter') {
      event.preventDefault()
      if (listName.length > 0) {
        createShoppingList()
      }
    }
  }

  const dialogAriaLabel = `${dialogTitle}, ${t('shopping_lists.create.description')}`

  return (
    <>
      <form>
        <Modal
          size={ModalSize.SMALL_ALIGN_LEFT}
          title={dialogTitle}
          aria-label={dialogAriaLabel}
          description={t('shopping_lists.create.description')}
          onClose={onCancel}
          primaryActionLoading={isLoading}
          primaryActionText={t('button.create')}
          primaryActionDisabled={listName.length === 0}
          onPrimaryAction={createShoppingList}
          secondaryActionText={t('button.cancel')}
          onSecondaryAction={onCancel}
        >
          <div onKeyDown={onListNameKeyDown}>
            <Input
              value={listName}
              label="shopping_lists.create.input_label"
              onChange={(event) => {
                setListName(event.target.value)
              }}
              maxLength={30}
              autoFocus
            />
          </div>
        </Modal>
      </form>
      {isErrorDialogVisible && (
        <ShoppingListsErrorDialog
          message={t('shopping_lists.create.error_message')}
          closeDialog={() => displayErrorDialog(false)}
        />
      )}
    </>
  )
}

CreateShoppingListDialog.propTypes = {
  t: PropTypes.func,
  onCreate: PropTypes.func,
  onCancel: PropTypes.func,
}

const CreateShoppingListDialogWithTranslate = withTranslate(
  CreateShoppingListDialog,
)

export { CreateShoppingListDialogWithTranslate as CreateShoppingListDialog }

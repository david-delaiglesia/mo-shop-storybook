import PropTypes from 'prop-types'

import { Modal, ModalSize } from '@mercadona/mo.library.shop-ui/modal'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './ShoppingListsErrorDialog.css'

const ShoppingListsErrorDialog = ({ t, message, closeDialog }) => {
  const errorAriaLabel = `${t('shopping_lists.error_title')}${message}`

  return (
    <Modal
      size={ModalSize.SMALL}
      aria-label={errorAriaLabel}
      title={t('shopping_lists.error_title')}
      description={message}
      primaryActionText={t('shopping_lists.error_button_text')}
      onPrimaryAction={closeDialog}
      onClose={closeDialog}
    />
  )
}

ShoppingListsErrorDialog.propTypes = {
  t: PropTypes.func,
  message: PropTypes.string,
  closeDialog: PropTypes.func,
}

const ShoppingListsErrorDialogWithTranslate = withTranslate(
  ShoppingListsErrorDialog,
)

export { ShoppingListsErrorDialogWithTranslate as ShoppingListsErrorDialog }

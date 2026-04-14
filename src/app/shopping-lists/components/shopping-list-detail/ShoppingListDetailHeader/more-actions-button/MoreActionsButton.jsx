import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { MoreActionsSubMenu } from './MoreActionsSubMenu'
import { PropTypes } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import { MoreActions28Icon } from 'system-ui/icons/28'
import { RoundedButton } from 'system-ui/rounded-button'

import './MoreActionsButton.css'

const MoreActionsButton = ({ t }) => {
  const [areMoreActionsVisible, displayMoreActions] = useState(false)
  const { listId } = useParams()
  const { listName, productsQuantity } = useShoppingListsContext()
  const hideMoreActionsSubMenu = () => displayMoreActions(false)

  const displaySubMenu = () => {
    ShoppingListsMetrics.moreActionsShoppingListButtonClick(
      listName,
      listId,
      productsQuantity,
    )
    displayMoreActions(true)
  }

  return (
    <div className="more-actions-button__wrapper">
      <RoundedButton
        aria-label={t('shopping_lists.header_actions.options')}
        label={t('shopping_lists.delete_list.more_actions_button_text')}
        onClick={displaySubMenu}
        data-testid="more-actions"
        Icon={MoreActions28Icon}
      />
      <div
        aria-hidden={true}
        className="body1-sb more-actions-button__caption-non-div"
        onClick={displaySubMenu}
      >
        {t('shopping_lists.header_actions.options')}
      </div>
      {areMoreActionsVisible && (
        <MoreActionsSubMenu
          handleClickOutside={() => {
            displayMoreActions(false)
            ShoppingListsMetrics.cancelDeleteShoppingListButtonClick(
              listName,
              listId,
              productsQuantity,
            )
          }}
          hideMoreActionsSubMenu={hideMoreActionsSubMenu}
        />
      )}
    </div>
  )
}

MoreActionsButton.propTypes = {
  t: PropTypes.func,
}

const MoreActionsButtonWithTranslate = withTranslate(MoreActionsButton)

export { MoreActionsButtonWithTranslate as MoreActionsButton }

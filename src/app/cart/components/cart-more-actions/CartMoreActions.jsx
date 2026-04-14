import { useTranslation } from 'react-i18next'

import { func } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { useUserUUID } from 'app/authentication'
import { ShoppingListIcon } from 'system-ui/icons'
import { withClickOutside } from 'wrappers/click-out-handler/ClickOutHandler'

const CartMoreActionsImplementation = ({ openCreateListModal, cleanCart }) => {
  const { t } = useTranslation()

  const customerId = useUserUUID()

  return (
    <div className="cart-detail__more-actions-items">
      <button
        disabled={!customerId}
        className="cart-detail__more-actions-item subhead1-r"
        onClick={openCreateListModal}
      >
        {t('cart.save_to_list')}
        <ShoppingListIcon size={16} />
      </button>
      <button
        onClick={cleanCart}
        className="cart-detail__more-actions-item cart-detail__more-actions-item--destructive subhead1-r"
      >
        {t('cart.delete_cart')}
        <Icon icon="delete" />
      </button>
    </div>
  )
}

CartMoreActionsImplementation.propTypes = {
  openCreateListModal: func.isRequired,
  cleanCart: func.isRequired,
}

export const CartMoreActions = withClickOutside(CartMoreActionsImplementation)

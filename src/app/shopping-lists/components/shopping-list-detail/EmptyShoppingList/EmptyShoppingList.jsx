import emptyShoppingListImage from './empty-shopping-list.svg'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'

import './EmptyShoppingList.css'

const EmptyShoppingList = () => {
  return (
    <div className="empty-shopping-list__wrapper">
      <div className="empty-shopping-list__content-wrapper">
        <img
          alt=""
          src={emptyShoppingListImage}
          className="empty-shopping-list__image"
        />
      </div>
    </div>
  )
}

const EmptyShoppingListWithTranslate = withTranslate(EmptyShoppingList)

export { EmptyShoppingListWithTranslate as EmptyShoppingList }

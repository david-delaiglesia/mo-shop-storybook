import { bool, object } from 'prop-types'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import {
  ShoppingListAsideItem,
  ShoppingListAsideItemMyRegulars,
} from 'app/order/components/shopping-list-aside-item'

import './ShoppingListAside.css'

const ShoppingListAside = ({
  shoppingListMenuAsideRef,
  response,
  isLoading,
}) => {
  return (
    <aside
      className="shopping-list-aside__wrapper"
      ref={shoppingListMenuAsideRef}
    >
      <div className="shopping-list-aside__content-wrapper">
        {isLoading && (
          <div className="shopping-list-aside__loader">
            <Loader ariaLabel="Cargando listas" />
          </div>
        )}
        {!isLoading && (
          <>
            <ShoppingListAsideItemMyRegulars />
            {response.shoppingLists.map((list, index) => {
              return (
                <ShoppingListAsideItem
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  productsQuantity={list.productsQuantity}
                  thumbnailImages={list.thumbnailImages}
                  order={index}
                />
              )
            })}
          </>
        )}
      </div>
    </aside>
  )
}

ShoppingListAside.propTypes = {
  shoppingListMenuAsideRef: object,
  response: object,
  isLoading: bool,
}

export { ShoppingListAside }

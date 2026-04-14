import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { func, object } from 'prop-types'

import { ProductFormat } from 'app/catalog/components/product-format'
import { ProductPrice } from 'app/catalog/components/product-price'
import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics'
import { useShoppingListsContext } from 'app/shopping-lists/infra/shopping-lists-provider'
import { ShoppingListIcon } from 'system-ui/icons/ShoppingListIcon'
import { ShoppingListIconEmpty } from 'system-ui/icons/ShoppingListIconEmpty'

import './SearchProductItem.css'

const SearchProductItem = ({ result: product, t }) => {
  const { productsIds, reFetchListDetail, listName, productsQuantity } =
    useShoppingListsContext()
  const { listId } = useParams()
  const user = useSelector((state) => state.user)
  const isProductInList = productsIds?.includes(product.id)
  const [isSaved, setIsSaved] = useState(isProductInList)

  const addProductToList = async () => {
    setIsSaved(true)
    await ShoppingListsClient.addProductToShoppingList(
      user.uuid,
      product.id,
      listId,
    )
    reFetchListDetail()
    ShoppingListsMetrics.clickOnProductFromSearch(
      'add',
      listId,
      listName,
      productsQuantity,
      product.id,
      product.display_name,
    )
  }

  const deleteProductFromList = async () => {
    setIsSaved(false)
    await ShoppingListsClient.deleteProductFromShoppingList(
      user.uuid,
      listId,
      product.id,
    )
    reFetchListDetail()
    ShoppingListsMetrics.clickOnProductFromSearch(
      'remove',
      listId,
      listName,
      productsQuantity,
      product.id,
      product.display_name,
    )
  }

  return (
    <div
      className="search-product-item__container"
      key={product.id}
      aria-label={product.display_name}
    >
      <div className="search-product-item__wrapper">
        <img
          className="search-product-item__image"
          src={product.thumbnail}
          alt=""
        />
        <div className="search-product-item__data">
          <div className="search-product-item__name subhead1-r">
            {product.display_name}
          </div>
          <ProductFormat
            className="search-product-item__format"
            product={product}
          />
          <ProductPrice priceInstructions={product.price_instructions} />
        </div>
        {!isSaved && (
          <div className="search-product-item__action-wrapper--not-saved">
            <button
              onClick={addProductToList}
              className="subhead1-sb search-product-item__action-wrapper"
              type="button"
            >
              <ShoppingListIconEmpty className="search-product-item__save-button-icon" />
              {t('shopping_lists.search.save')}
            </button>
          </div>
        )}
        {isSaved && (
          <div className="search-product-item__action-wrapper search-product-item__action-wrapper--saved">
            <button
              onClick={deleteProductFromList}
              className="subhead1-sb search-product-item__action-wrapper"
              type="button"
            >
              <ShoppingListIcon className="search-product-item__saved-icon" />
              {t('shopping_lists.search.saved')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const SearchProductItemWithTranslate = withTranslate(SearchProductItem)

SearchProductItem.propTypes = {
  t: func,
  result: object,
}

export { SearchProductItemWithTranslate as SearchProductItem }

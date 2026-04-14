import { useEffect, useState } from 'react'

import { object } from 'prop-types'

import { ProductCellSwitch } from 'app/catalog/components/product-cell-switch'
import { orderByCategory } from 'app/shopping-lists/domain/order-products'

import './OrderByCategoryList.css'

export const OrderByCategoryList = ({ listDetail }) => {
  const [orderedList, setOrderedList] = useState([])

  useEffect(() => {
    const orderedResult = orderByCategory(listDetail)
    setOrderedList(orderedResult)
  }, [listDetail])

  return (
    <div>
      {orderedList.map((listOrderedByCategory) => {
        return (
          <section key={listOrderedByCategory.id}>
            <h2 className="headline1-b shopping-list-detail-order-by-category-list__title">
              {listOrderedByCategory.name}
            </h2>
            <div className="shopping-list-detail-order-by-category-list__wrapper">
              {listOrderedByCategory.products.map((product, index) => {
                return (
                  <ProductCellSwitch
                    key={product.id}
                    productId={product.id}
                    order={index}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

OrderByCategoryList.propTypes = {
  listDetail: object,
}

import { number, object } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import {
  OUT_OF_STOCK,
  UnpublishedProductCell,
} from 'app/catalog/components/product-cell'
import { ProductCellContainer } from 'app/catalog/containers/product-cell-container'
import { useOrder } from 'app/order/context'
import { Product, ProductPropTypes } from 'domain/product'
import { Session } from 'services/session'
import { withRecommendation } from 'wrappers/recommendation-provider'

const ProductCellSwitch = ({ product, style, order }) => {
  const orderContext = useOrder()
  const warehouse = orderContext?.warehouse || Session.get().warehouse
  const isNotPublished = !Product.isPublished(product)
  const isOutOfStock = Product.isOutOfStock(product)

  if (isOutOfStock) {
    return (
      <UnpublishedProductCell
        product={product}
        warehouse={warehouse}
        style={style}
        cellType={OUT_OF_STOCK}
        order={order}
      />
    )
  }

  if (isNotPublished) {
    return (
      <UnpublishedProductCell
        product={product}
        warehouse={warehouse}
        style={style}
      />
    )
  }

  return (
    <ProductCellContainer
      product={product}
      warehouse={warehouse}
      style={style}
      order={order}
      orderContext={orderContext}
    />
  )
}

ProductCellSwitch.propTypes = {
  product: ProductPropTypes,
  style: object,
  order: number,
}

ProductCellSwitch.defaultProps = {
  style: {},
}

const ComposedProductCellSwitch = compose(withRecommendation)(ProductCellSwitch)

export { ComposedProductCellSwitch as ProductCellSwitch }

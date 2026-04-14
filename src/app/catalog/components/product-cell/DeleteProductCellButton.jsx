import { func, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { useMyRegulars } from 'wrappers/recommendation-provider/RecommendationProvider'

import './DeleteProductCellButton.css'

const DeleteProductCellButton = ({ t, product }) => {
  const myRegularContext = useMyRegulars()

  return (
    <button
      className="delete-product-cell-button"
      aria-label={t('remove_product_aria', {
        productName: product.display_name,
      })}
      onClick={() => myRegularContext.removeMyRegularProduct(product)}
    >
      <Icon icon="delete" />
    </button>
  )
}

DeleteProductCellButton.propTypes = {
  t: func,
  product: object,
}

export { DeleteProductCellButton }

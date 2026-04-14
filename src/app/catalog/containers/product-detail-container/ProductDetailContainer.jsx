import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { bool, func, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { SOURCES } from 'app/cart/metrics'
import { CatalogClient } from 'app/catalog/client'
import { EmptyProduct } from 'app/catalog/components/empty-product'
import { PrivateProductDetailContainer } from 'app/catalog/containers/private-product-detail-container'
import { PublicProductDetailContainer } from 'app/catalog/containers/public-product-detail-container'
import { OrderClient } from 'app/order/client'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import { CartPropTypes } from 'domain/cart'
import { ProductPropTypes } from 'domain/product'
import { PATHS } from 'pages/paths'
import { addArrayProduct, addProduct } from 'pages/product/actions'
import { interpolatePath } from 'pages/routing'
import { HTTP_STATUS, NetworkError } from 'services/http'

const requiresAddSlug = (productSlug, apiProductSlug, modalProductId) => {
  return !productSlug || (productSlug !== apiProductSlug && modalProductId)
}

class ProductDetailContainer extends Component {
  state = {
    productUnavailable: false,
    xSellingProducts: [],
  }

  componentDidMount() {
    const { publicMode } = this.props

    this.getProductDetail()

    if (publicMode) return

    this.prepareProductXSelling()
  }

  componentDidUpdate({ lang: prevLang, productId: prevProductId }) {
    const { publicMode, lang, productId } = this.props

    const hasLangChanged = prevLang !== lang
    const hasProductIdChanged = prevProductId !== productId

    if (hasLangChanged || hasProductIdChanged) {
      this.getProductDetail()

      if (publicMode) return null

      this.prepareProductXSelling()
    }
  }

  checkProductSlug = (apiProductSlug) => {
    const {
      productId,
      match: { params },
      history,
      editingOrder,
      modalProductId,
    } = this.props
    const productSlug = params.slug

    if (editingOrder) return null

    if (requiresAddSlug(productSlug, apiProductSlug, modalProductId)) {
      const urlNewPath = interpolatePath(PATHS.PRODUCT_SLUG, {
        id: productId,
        slug: apiProductSlug,
      })

      window.history.replaceState(
        window.history.state,
        document.title,
        urlNewPath,
      )
      return
    }

    if (productSlug !== apiProductSlug) {
      history.replace(PATHS.NOT_FOUND)
      return
    }
  }

  shouldOpenDetailFromOrder = () => {
    const { editingOrder, source } = this.props

    return editingOrder && source === SOURCES.CART
  }

  getProductDetail = async () => {
    const {
      productId,
      warehouse,
      addProduct,
      match: { params },
      onShowCloseButtonModal,
    } = this.props
    try {
      const { userUuid: customerId } = this.props
      let productDetail

      if (this.shouldOpenDetailFromOrder()) {
        const orderId = params.id
        productDetail = await OrderClient.getProductDetail({
          customerId,
          orderId,
          productId,
          warehouse,
        })
      } else {
        productDetail = await CatalogClient.getProductDetail(
          productId,
          warehouse,
        )
      }

      this.checkProductSlug(productDetail.slug)
      addProduct(productDetail)
      this.setState({ productUnavailable: false })
      onShowCloseButtonModal()
    } catch (error) {
      if (error.status === HTTP_STATUS.GONE) {
        this.setState({ productUnavailable: true })
        return
      }

      NetworkError.publish(error)
    }
  }

  prepareProductXSelling = async () => {
    this.setState({ xSellingProducts: [] }, this.getProductXSelling)
  }

  getProductXSelling = async () => {
    const { productId, warehouse, addArrayProduct, publicMode, cart } =
      this.props

    if (publicMode) {
      return
    }

    const cartProductIds = Object.keys(cart.products)
    const xSelling = await CatalogClient.getProductXSelling(
      productId,
      warehouse,
      cartProductIds.join(','),
    )
    const xSellingProducts = xSelling?.results ?? []
    const xSellingProductsObject = xSellingProducts.reduce((acc, product) => {
      return { ...acc, [product.id]: product }
    }, {})
    this.setState({ xSellingProducts })
    addArrayProduct(xSellingProductsObject)
  }

  render() {
    const { productUnavailable, xSellingProducts } = this.state
    const { productId, product, publicMode, editingOrder, source, sourceCode } =
      this.props

    if (productUnavailable) {
      return <EmptyProduct productId={productId} />
    }

    if (!product) return null

    if (publicMode) {
      if (!product.details) return null

      return <PublicProductDetailContainer product={product} />
    }

    return (
      <ProductMetricsContext.Provider value={{ sourceCode, source }}>
        <PrivateProductDetailContainer
          product={product}
          editingOrder={editingOrder}
          xSellingProducts={xSellingProducts}
        />
      </ProductMetricsContext.Provider>
    )
  }
}

ProductDetailContainer.propTypes = {
  productId: string.isRequired,
  cart: CartPropTypes.isRequired,
  publicMode: bool,
  source: string,
  sourceCode: string,
  warehouse: string.isRequired,
  match: shape({
    params: shape({
      slug: string,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  editingOrder: bool,
  modalProductId: string,
  product: ProductPropTypes,
  lang: string.isRequired,
  addProduct: func.isRequired,
  addArrayProduct: func.isRequired,
  userUuid: string,
  onShowCloseButtonModal: func,
}

ProductDetailContainer.defaultProps = {
  publicMode: false,
  onShowCloseButtonModal: () => null,
}

const mapStateToProps = (
  { products, cart, language, ui: { productModal }, session },
  { productId },
) => ({
  cart,
  editingOrder: productModal.editingOrder,
  modalProductId: productModal.productId,
  product: products[productId],
  lang: language,
  userUuid: session.uuid,
})

const mapDispatchToProps = {
  addProduct,
  addArrayProduct,
}

const ComposedProductDetailContainer = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ProductDetailContainer)

export { ComposedProductDetailContainer as ProductDetailContainer }

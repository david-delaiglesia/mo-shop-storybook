import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { bool, func, number, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { cleanProductModalProduct } from 'app/catalog/actions'
import { ProductDetailContainer } from 'app/catalog/containers/product-detail-container'
import { sendProductDetailViewMetrics } from 'app/catalog/metrics'
import Modal from 'components/modal'
import { ProductListPropTypes } from 'domain/product'
import { PATHS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'

import './styles/ProductModal.css'

const isFirstProductInModal = (prevProductId) => !prevProductId

class ProductModal extends Component {
  state = {
    showButtonModal: false,
  }

  componentDidUpdate(prevProps) {
    const { productId: prevProductId } = prevProps
    const { history, productId, productSlug, editingOrder, products } =
      this.props

    const isSameProduct = prevProductId === productId
    if (isSameProduct || editingOrder || !productId) {
      return
    }

    const pathToInterpolate = PATHS.PRODUCT_SLUG
    const urlNewPath = interpolatePath(pathToInterpolate, {
      id: productId,
      slug: productSlug,
    })
    this.unlisten = history.listen(this.goBackHandler)

    if (isFirstProductInModal(prevProductId)) {
      const { source, page, section, position, sectionPosition } = this.props

      sendProductDetailViewMetrics({
        product: products[productId],
        source,
        page,
        section,
        position,
        sectionPosition,
      })
      window.history.pushState(window.history.state, document.title, urlNewPath)
      return
    }
    window.history.replaceState(
      window.history.state,
      document.title,
      urlNewPath,
    )
  }

  componentWillUnmount() {
    this.unlisten && this.unlisten()
  }

  goBackHandler = () => {
    this.setState({ showButtonModal: false })
    this.props.cleanProductModalProduct()
    this.unlisten()
  }

  closeModal = () => {
    const { editingOrder, cleanProductModalProduct, history } = this.props
    this.setState({ showButtonModal: false })

    cleanProductModalProduct()

    if (editingOrder) {
      return
    }
    this.unlisten && this.unlisten()
    history.goBack()
  }

  handleShowCloseButtonModal = () => {
    this.setState({ showButtonModal: true })
  }

  render() {
    const { productId, source, sourceCode, warehouse } = this.props

    if (!productId) return null

    return (
      <Modal
        onClose={this.closeModal}
        className="product-modal"
        ariaLabelClose="aria_label_close"
        showButtonModal={this.state.showButtonModal}
      >
        <ProductDetailContainer
          productId={productId}
          source={source}
          sourceCode={sourceCode}
          warehouse={warehouse}
          onShowCloseButtonModal={this.handleShowCloseButtonModal}
        />
      </Modal>
    )
  }
}

ProductModal.propTypes = {
  productId: string,
  productSlug: string,
  cleanProductModalProduct: func.isRequired,
  source: string,
  sourceCode: string,
  warehouse: string,
  page: string,
  section: string,
  position: number,
  sectionPosition: number,
  history: shape({
    push: func.isRequired,
    listen: func.isRequired,
    goBack: func.isRequired,
  }).isRequired,
  editingOrder: bool,
  products: ProductListPropTypes.isRequired,
}

const mapStateToProps = ({ ui: { productModal }, products }) => ({
  productId: productModal.productId,
  productSlug: productModal.productSlug,
  editingOrder: productModal.editingOrder,
  source: productModal.source,
  sourceCode: productModal.sourceCode,
  warehouse: productModal.warehouse,
  page: productModal.page,
  section: productModal.section,
  position: productModal.position,
  sectionPosition: productModal.sectionPosition,
  products,
})

const mapDispatchToProps = {
  cleanProductModalProduct,
}

const ComposedProductModal = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ProductModal)

export { ComposedProductModal as ProductModal }

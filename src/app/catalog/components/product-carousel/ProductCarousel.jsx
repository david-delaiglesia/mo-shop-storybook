import { Component, createRef } from 'react'

import { array, func, string } from 'prop-types'

import { ProductCellSwitch } from 'app/catalog/components/product-cell-switch'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ProductMetricsContext } from 'app/shared/product-metrics-context'
import Arrow from 'system-ui/arrow'
import { TAB_INDEX } from 'utils/constants'

import './styles/ProductCarousel.css'

const PRODUCT_CELL_WIDTH = 216

class ProductCarousel extends Component {
  containerRef = createRef()

  state = {
    currentPage: 0,
    availableWidth: 0,
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
    this.setAvailableWidth()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = (e) => {
    const oldresize = window.onresize

    const event = window.event || e
    if (typeof oldresize === 'function' && !oldresize.call(window, event)) {
      return false
    }
    this.setState({ currentPage: 0 })
    this.setAvailableWidth()
  }

  setAvailableWidth = () => {
    if (!this.containerRef.current) return

    const availableWidth =
      this.containerRef.current.getBoundingClientRect().width

    this.setState({ availableWidth })
  }

  getHorizontalPosition = () => {
    const { products } = this.props
    const { currentPage, availableWidth } = this.state

    if (!availableWidth) return { transform: 'translateX(0px)' }

    const totalElements = products.length

    const elementsPerPage = Math.floor(availableWidth / PRODUCT_CELL_WIDTH)
    const totalPages = Math.ceil(totalElements / elementsPerPage)
    const prevPage = currentPage - 1
    const elementsPrevPage = elementsPerPage * prevPage

    let elementsCurrentPage = elementsPerPage
    if (currentPage === totalPages) {
      elementsCurrentPage = totalElements - elementsPerPage * prevPage
    }

    const offSet =
      (elementsPrevPage + elementsCurrentPage) * PRODUCT_CELL_WIDTH * -1

    return { transform: `translateX(${offSet}px)` }
  }

  showPrevPage = () => {
    this.setState(({ currentPage }) => ({ currentPage: currentPage - 1 }))
  }

  renderLeftArrow = () => {
    const { products } = this.props
    const { currentPage, availableWidth } = this.state
    const totalElements = products.length
    const leftArrowDisabled = currentPage === 0

    if (!totalElements || leftArrowDisabled) return null

    const elementsPerPage = Math.floor(availableWidth / PRODUCT_CELL_WIDTH)
    const totalPages = Math.ceil(totalElements / elementsPerPage)

    if (totalPages <= 1) return null

    return (
      <Arrow
        direction="left"
        ariaLabel="previous-related-products-page"
        click={this.showPrevPage}
      />
    )
  }

  showNextPage = () => {
    this.setState(({ currentPage }) => ({ currentPage: currentPage + 1 }))
  }

  renderRightArrow = () => {
    const { products } = this.props
    const { currentPage, availableWidth } = this.state
    const totalElements = products.length

    if (!totalElements) return null

    const elementsPerPage = Math.floor(availableWidth / PRODUCT_CELL_WIDTH)
    const totalPages = Math.ceil(totalElements / elementsPerPage)
    const rightArrowDisabled = currentPage === totalPages - 1

    if (totalPages <= 1 || rightArrowDisabled) return null

    return (
      <Arrow
        direction="right"
        ariaLabel="next-related-products-page"
        click={this.showNextPage}
      />
    )
  }

  render() {
    const { products, source, sourceCode, layout, t } = this.props

    const productsHorizontalPosition = this.getHorizontalPosition()

    return (
      <div
        className="product-carousel"
        data-testid="product-carousel"
        ref={this.containerRef}
      >
        <h2 tabIndex={TAB_INDEX.ENABLED} className="body1-sb">
          {t('x_selling_title')}
        </h2>
        {this.renderLeftArrow()}
        <div className="product-carousel__products">
          <ProductMetricsContext.Provider
            value={{ sourceCode, source, layout }}
          >
            {products.map((product, index) => (
              <ProductCellSwitch
                key={product.id}
                style={productsHorizontalPosition}
                productId={product.id}
                order={index}
              />
            ))}
          </ProductMetricsContext.Provider>
        </div>
        {this.renderRightArrow()}
      </div>
    )
  }
}

ProductCarousel.propTypes = {
  products: array.isRequired,
  source: string,
  sourceCode: string,
  layout: string,
  t: func.isRequired,
}

const ComposedProductCarousel = withTranslate(ProductCarousel)

export { ComposedProductCarousel as ProductCarousel }

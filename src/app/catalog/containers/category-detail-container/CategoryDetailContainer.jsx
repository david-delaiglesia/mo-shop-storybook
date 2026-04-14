import { Component, createRef } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import CategorySection from '../../components/category-section'
import { CategoryDetailTitle } from './CategoryDetailTitle'
import { func, number, object, shape, string } from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'

import { CatalogClient } from 'app/catalog/client'
import { sendCategoryNextButtonClickMetrics } from 'app/catalog/metrics'
import { serializeProductsSections } from 'app/catalog/serializer'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { EDIT_ORDER_VIEW } from 'app/order/components/edit-order-products-content'
import { CategoryDetailPlaceholder } from 'components/category-detail-placeholder'
import { Category } from 'domain/category'
import { addArrayProduct } from 'pages/product/actions'

import './CategoryDetailContainer.css'

class CategoryDetailContainer extends Component {
  lastCategoryId = null
  state = {
    categories: [],
    categoryName: '',
    categoryBannerUrl: '',
    warehouse: undefined,
  }

  constructor(props) {
    super(props)
    this.containerRef = createRef()

    this.setCategoryInfoState = this.setCategoryInfoState.bind(this)
  }

  componentDidMount() {
    if (!this.props.categoryId) return

    const { orderWarehouse } = this.props
    const { warehouse } = this.props.session

    let warehouseUpdated = warehouse
    if (typeof orderWarehouse !== 'undefined') {
      warehouseUpdated = orderWarehouse
    }
    this.getCategoriesDetailWithWarehouse(
      this.props.categoryId,
      warehouseUpdated,
    )
  }

  componentDidUpdate(prevProps) {
    const categoryHasChanged =
      prevProps.categoryId !== this.props.categoryId &&
      !isNaN(this.props.categoryId)
    const languageHasChanged = prevProps.language !== this.props.language
    const { orderWarehouse } = this.props
    const { warehouse } = this.props.session

    let warehouseUpdated = warehouse
    if (typeof orderWarehouse !== 'undefined') {
      warehouseUpdated = orderWarehouse
    }

    if (categoryHasChanged) {
      this.setState({ categories: [] })
      this.containerRef.current.scrollIntoView()
      this.containerRef.current.scrollTo(0, 0)
    }

    if (
      categoryHasChanged ||
      languageHasChanged ||
      this.state.warehouse !== warehouseUpdated
    ) {
      this.getCategoriesDetailWithWarehouse(
        this.props.categoryId,
        warehouseUpdated,
      )
    }

    if (this.state.warehouse !== warehouseUpdated) {
      this.setState({ warehouse: warehouseUpdated })
    }
  }

  setCategoryInfoState(response) {
    if (response.id !== this.lastCategoryId) return

    const { sections, products } = serializeProductsSections(
      response.categories,
    )
    this.setState({
      categories: sections,
      categoryName: response.name,
      categoryBannerUrl: response.banner_url,
    })
    this.props.addArrayProduct(products)
  }

  async getCategoriesDetailWithWarehouse(id, warehouseUpdated) {
    const userId = this?.props?.session?.uuid

    this.lastCategoryId = id
    const { fetchingFrom } = this.props
    const shouldHideTemporarilyUnavailableProducs =
      fetchingFrom === EDIT_ORDER_VIEW

    const categoryDetail =
      await CatalogClient.getCategoryDetailWithUpdatedWarehouse(
        id,
        warehouseUpdated,
        shouldHideTemporarilyUnavailableProducs,
        !!userId,
      )

    if (!categoryDetail) return

    this.setCategoryInfoState(categoryDetail)
  }

  goToNextCategory = () => {
    const { history, categoryId, nextSubcategory, nextSubcategoryPath } =
      this.props

    history.push(nextSubcategoryPath)
    sendCategoryNextButtonClickMetrics({ categoryId, nextSubcategory })
  }

  render() {
    const { nextSubcategory, t } = this.props
    const { categories, categoryName } = this.state

    return (
      <div ref={this.containerRef} className="category-detail">
        {!categories.length > 0 ? (
          <CategoryDetailPlaceholder />
        ) : (
          <div className="category-detail__content">
            <CategoryDetailTitle categoryName={categoryName} />
            {categories.map((category, index) => (
              <CategorySection
                key={category.id}
                name={category.name}
                description={category.subtitle}
                image={category.image}
                isExtended={Category.isExtended(category)}
                products={category.products}
                sectionPosition={index}
                sectionId={category.id}
                categoryId={this.props.categoryId}
              />
            ))}
            {nextSubcategory && (
              <Button
                className="category-detail__next-subcategory"
                variant="secondary"
                size="big"
                role="link"
                onClick={this.goToNextCategory}
              >
                {t('categories.footer', { categoryName: nextSubcategory.name })}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
}

CategoryDetailContainer.propTypes = {
  addArrayProduct: func.isRequired,
  categoryId: number,
  nextSubcategory: object,
  nextSubcategoryPath: string,
  language: string,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  t: func.isRequired,
  session: shape({
    warehouse: string.isRequired,
  }).isRequired,
  orderWarehouse: string,
  fetchingFrom: string,
}

const mapStateToProps = ({ language, session }) => ({
  language,
  session,
})

const mapDispatchToProps = {
  addArrayProduct,
}

const CategoryDetailConnected = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CategoryDetailContainer)

const CategoryDetailComposed = withTranslate(
  withRouter(CategoryDetailConnected),
)

export { CategoryDetailComposed as CategoryDetailContainer }

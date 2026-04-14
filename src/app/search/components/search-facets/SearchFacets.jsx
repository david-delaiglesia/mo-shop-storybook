import { Component } from 'react'
import { connect } from 'react-redux'

import { func, object, shape, string } from 'prop-types'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { filterBrands, filterCategories, search } from 'app/search/commands'
import BrandsFilter from 'app/search/components/brands-filter'
import CategoriesFilter from 'app/search/components/categories-filter'
import {
  sendFacetsBrandClickMetrics,
  sendFacetsCategoryClickMetrics,
} from 'app/search/metrics'
import { Session } from 'services/session'

import './SearchFacets.css'

class SearchFacets extends Component {
  CATEGORY_LEVEL = {
    ROOT: 0,
    CHILD: 1,
    LEAF: 2,
  }

  state = {
    selectedCategory: {},
    selectedBrands: [],
    warehouse: undefined,
  }

  constructor() {
    super()

    this.selectBrand = this.selectBrand.bind(this)
    this.selectCategory = this.selectCategory.bind(this)
    this.search = this.search.bind(this)
  }

  componentDidUpdate(prevProps) {
    const hasChangedQuery = prevProps.search.query !== this.props.search.query
    if (hasChangedQuery) {
      this.resetFacets()
    }

    const hasChangedLanguage = prevProps.language !== this.props.language
    if (hasChangedLanguage) {
      this.search()
    }
    const { warehouse } = this.props.session

    if (this.state.warehouse !== warehouse) {
      this.setState({ warehouse: warehouse })

      this.filterBrands()
      this.filterCategories()
    }
  }

  resetFacets() {
    this.setState({
      selectedCategory: {},
      selectedBrands: [],
    })
  }

  selectBrand(brand) {
    const { search } = this.props
    const selectedBrands = this.getUpdatedBrandsSelection(brand)
    this.setState({ selectedBrands }, this.filterBrands)
    sendFacetsBrandClickMetrics({ brand, search })
  }

  getUpdatedBrandsSelection(brand) {
    if (this.state.selectedBrands.includes(brand)) {
      return this.state.selectedBrands.filter(
        (selectedBrand) => selectedBrand !== brand,
      )
    }

    return [...this.state.selectedBrands, brand]
  }

  selectCategory(category) {
    const { search } = this.props
    const selectedCategory = this.getSelectedCategory(category)
    const nextState = {
      selectedCategory,
      selectedBrands: [],
    }

    if (!selectedCategory.id) {
      return this.setState(nextState, this.search)
    }

    this.setState(nextState, this.filterCategories)
    sendFacetsCategoryClickMetrics({ category: selectedCategory, search })
  }

  getSelectedCategory(category) {
    const isSelected = this.state.selectedCategory.id === category.id

    const isRootCategory = category.level === this.CATEGORY_LEVEL.ROOT
    if (isRootCategory && isSelected) {
      return {}
    }

    const isChildCategory = category.level === this.CATEGORY_LEVEL.CHILD
    if (isChildCategory && isSelected) {
      return this.getParentCategory(category)
    }

    return category
  }

  getParentCategory(selectedCategory) {
    const { categories } = this.props.search
    if (!categories) {
      return {}
    }

    return categories.find((category) =>
      this.findCategory(category, selectedCategory),
    )
  }

  findCategory(parentCategory, selectedCategory) {
    return parentCategory.categories.find(
      (currentCategory) => currentCategory.id === selectedCategory.id,
    )
  }

  searchWithState(command) {
    const { query } = this.props.search
    if (!query) return
    const { selectedBrands, selectedCategory } = this.state
    const options = {
      query,
      brands: selectedBrands,
      category: selectedCategory,
      warehouse: Session.get().warehouse,
    }

    command(options)
  }

  search() {
    this.searchWithState(this.props.filterSearch)
  }

  filterBrands() {
    this.searchWithState(this.props.filterBrands)
  }

  filterCategories() {
    this.searchWithState(this.props.filterCategories)
  }

  render() {
    const { categories, brands, query, hits } = this.props.search
    const { t } = this.props

    return (
      <div
        data-testid="search-sidebar"
        className="search-sidebar"
        aria-label={t('accessibility.filter_results')}
      >
        {categories && (
          <CategoriesFilter
            categories={categories}
            selectedCategory={this.state.selectedCategory}
            selectCategory={this.selectCategory}
            query={query}
            hitsCount={hits.length}
          />
        )}
        {brands && (
          <BrandsFilter
            brands={brands}
            selectedBrands={this.state.selectedBrands}
            selectBrand={this.selectBrand}
            query={query}
            hitsCount={hits.length}
          />
        )}
      </div>
    )
  }
}

SearchFacets.propTypes = {
  search: object.isRequired,
  language: string.isRequired,
  filterSearch: func.isRequired,
  filterCategories: func.isRequired,
  filterBrands: func.isRequired,
  session: shape({
    warehouse: string.isRequired,
  }).isRequired,
  t: func,
}

const mapStateToProps = ({ search, language, session }) => ({
  search,
  language,
  session,
})

const mapDispatchToProps = {
  filterSearch: createThunk(search),
  filterCategories: createThunk(filterCategories),
  filterBrands: createThunk(filterBrands),
}

const ConnectedSearchFacets = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchFacets)

export { ConnectedSearchFacets as SearchFacets }

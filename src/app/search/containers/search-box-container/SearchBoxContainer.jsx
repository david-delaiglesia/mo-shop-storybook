import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { withNavigationHandler } from './withNavigationHandler'
import { bool, func, object, string } from 'prop-types'
import { compose } from 'redux'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { search as debouncedSearch } from 'app/search/commands'
import { SearchBox } from 'app/search/components/search-box'
import { Session } from 'services/session'

class SearchBoxContainer extends Component {
  state = {
    query: this.props.defaultQuery,
  }

  componentDidMount() {
    if (!this.props.isSearchPage) {
      return
    }

    this.initSearch()
  }

  componentDidUpdate(prevProps) {
    const isChangedLocation = this.isChangedLocation(prevProps)
    if (!isChangedLocation) {
      return
    }

    const query = this.getQuerySearch(prevProps)
    this.updateQuery(query)
  }

  searchIn(prevProps) {
    const { isSearchPage } = this.props
    const searchIn = isSearchPage && !prevProps.isSearchPage

    return searchIn
  }

  getQuerySearch(prevProps) {
    if (!this.searchIn(prevProps)) {
      return ''
    }

    return this.state.query || this.props.defaultQuery
  }

  isChangedLocation(prevProps) {
    const { location } = this.props
    const isChangedLocation = location.pathname !== prevProps.location.pathname

    return isChangedLocation
  }

  updateQuery(query = '') {
    this.setState(
      {
        query: query.trimStart(),
        selectedBrands: [],
        selectedCategory: {},
      },
      this.initSearch,
    )
  }

  onChange = (event) => {
    const query = event.target.value
    this.updateQuery(query)
  }

  initSearch = () => {
    const { isSearchPage, onChange, search, warehouseOrder } = this.props
    const { query, selectedBrands, selectedCategory } = this.state
    const hasQuery = !!query

    onChange && onChange(query)

    if (!isSearchPage || !hasQuery) return

    const { warehouse } = Session.get()

    let warehouseUpdated = warehouse
    if (typeof warehouseOrder !== 'undefined') {
      warehouseUpdated = warehouseOrder
    }

    const options = {
      query,
      brands: selectedBrands,
      category: selectedCategory,
      warehouse: warehouseUpdated,
    }

    search(options)
  }

  render() {
    return (
      <SearchBox
        searchValue={this.state.query}
        onChange={this.onChange}
        onEnterKeyPress={this.props.redirectToSearch}
        onClose={this.onChange}
      />
    )
  }
}

SearchBoxContainer.propTypes = {
  defaultQuery: string,
  isSearchPage: bool,
  onChange: func,
  redirectToSearch: func,
  location: object.isRequired,
  search: func.isRequired,
  warehouseOrder: string,
}

const mapDispatchToProps = {
  search: createThunk(debouncedSearch),
}

const SearchBoxInEditPurchase = compose(
  connect(null, mapDispatchToProps),
  withRouter,
)(SearchBoxContainer)

const ComposedSearchBoxContainer = compose(
  connect(null, mapDispatchToProps),
  withRouter,
  withNavigationHandler,
)(SearchBoxContainer)

export {
  ComposedSearchBoxContainer as SearchBoxContainer,
  SearchBoxInEditPurchase,
}

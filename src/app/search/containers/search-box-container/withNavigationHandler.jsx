import { Component } from 'react'

import { func, shape, string } from 'prop-types'
import qs from 'qs'

import { PATHS } from 'pages/paths'
import { comparePath } from 'pages/routing'

const MIN_CHARS_TO_SEARCH = 3

export function withNavigationHandler(WrappedComponent) {
  class WithNavigationHandler extends Component {
    backUrl = PATHS.HOME

    constructor(props) {
      super(props)

      this.onChange = this.onChange.bind(this)
      this.isSearchPage = this.isSearchPage.bind(this)
      this.redirectToSearch = this.redirectToSearch.bind(this)
    }

    componentDidMount() {
      this.storeBackUrl(this.props.location.pathname)
    }

    shouldComponentUpdate(nextProps) {
      return this.locationChanged(nextProps.location.pathname)
    }

    componentDidUpdate() {
      this.storeBackUrl(this.props.location.pathname)
    }

    locationChanged(newPathName) {
      return this.props.location.pathname !== newPathName
    }

    onChange(query) {
      const isSearchPage = this.isSearchPage(this.props.location.pathname)

      if (query && query.length >= MIN_CHARS_TO_SEARCH && !isSearchPage) {
        return this.redirectToSearch()
      }

      if (query && isSearchPage) {
        return this.replaceLocation(query)
      }

      if (!query && isSearchPage) {
        return this.redirectBack()
      }
    }

    getUrlSearchQuery() {
      const { location } = this.props
      if (!location.search) {
        return
      }

      const params = location.search.slice(1)
      return qs.parse(params).query
    }

    replaceLocation(query) {
      if (!query) {
        return
      }
      const existingParams = qs.parse(this.props.location.search, {
        ignoreQueryPrefix: true,
      })
      const mergedParams = { ...existingParams, query }
      this.props.history.replace({
        ...this.props.location,
        search: qs.stringify(mergedParams, { addQueryPrefix: true }),
      })
    }

    redirectBack() {
      this.props.history.push(this.backUrl)
    }

    storeBackUrl(path) {
      if (this.isNavigablePage(path)) {
        return (this.backUrl = path)
      }

      if (!this.isSearchPage(path)) {
        return (this.backUrl = PATHS.HOME)
      }
    }

    isNavigablePage(pathname) {
      const navigablePages = [
        PATHS.HOME,
        PATHS.CATEGORY,
        PATHS.MY_REGULARS,
        PATHS.PRODUCT,
        PATHS.PRODUCT_SLUG,
      ]

      return navigablePages.some((path) => comparePath(pathname, path))
    }

    isSearchPage(pathname) {
      const isSearchPage = comparePath(pathname, PATHS.SEARCH_RESULTS)

      return !!isSearchPage
    }

    redirectToSearch() {
      const { location } = this.props
      if (this.isSearchPage(location.pathname)) {
        return
      }

      this.props.history.push({
        pathname: PATHS.SEARCH_RESULTS,
      })
    }

    redirectToHome() {
      this.props.history.push({
        pathname: PATHS.HOME,
      })
    }

    render() {
      const props = {
        onChange: this.onChange,
        defaultQuery: this.getUrlSearchQuery(),
        redirectToSearch: this.redirectToSearch,
        isSearchPage: this.isSearchPage(this.props.location.pathname),
        ...this.props,
      }

      return <WrappedComponent {...props} />
    }
  }

  WithNavigationHandler.displayName = `withNavigationHandler(${getDisplayName(
    WrappedComponent,
  )})`

  WithNavigationHandler.propTypes = {
    history: shape({
      push: func.isRequired,
      replace: func.isRequired,
    }).isRequired,
    location: shape({
      pathname: string.isRequired,
      search: string,
    }).isRequired,
  }

  return WithNavigationHandler
}

function getDisplayName(WrappedComponent) {
  return (
    WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name)
  )
}

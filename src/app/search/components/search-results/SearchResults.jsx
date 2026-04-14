import { useEffect } from 'react'
import { useRouteMatch } from 'react-router'

import { SearchNoResults } from '../search-no-results'
import { array, bool, func, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { ProductSection } from 'app/catalog/components/product-section'
import {
  LAYOUTS,
  SOURCES,
  SOURCE_CODES,
  addCampaignToUserProperties,
} from 'app/catalog/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { useSearchParam } from 'hooks/useSearchParam'
import { useSearchParams } from 'hooks/useSearchParams'
import { PATHS, URL_PARAMS } from 'pages/paths'

import './styles/SearchResults.css'

const getResultTranslation = (resultsCount, resultsQuery) => {
  return {
    key: 'search_bar_amount_results',
    interpolation: { resultsQuery, resultsCount },
  }
}

const SearchResults = ({ withMessage, search, t }) => {
  const isEditOrderPage = useRouteMatch({ path: PATHS.EDIT_ORDER_PRODUCTS })
  const isSearchPage = useRouteMatch({ path: PATHS.SEARCH_RESULTS })

  const { addSearchParam } = useSearchParams()

  const [searchParamFocusOnDetail] = useSearchParam(URL_PARAMS.FOCUS_ON_DETAIL)

  const { setFocusRef, focusOnElement } = useAccessibilityFocus({
    initialFocus: false,
  })

  const {
    setFocusRef: setShowingResultsFocusRef,
    focusOnElement: focusOnShowingResults,
  } = useAccessibilityFocus({
    initialFocus: false,
  })

  useEffect(() => {
    const layout = getScrollableContainer()
    const areResults = search.hits.length > 0

    if (!areResults || !layout) return

    addCampaignToUserProperties()

    layout.scrollTo(0, 0)
  }, [search])

  useEffect(() => {
    if (searchParamFocusOnDetail === 'search') {
      focusOnElement()
    }

    if (searchParamFocusOnDetail === 'results') {
      focusOnShowingResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamFocusOnDetail])

  const goToResults = () => {
    addSearchParam(URL_PARAMS.FOCUS_ON_DETAIL, 'results')
  }

  const goToFilters = () => {
    addSearchParam(URL_PARAMS.FOCUS_ON_DETAIL, 'filters')
  }

  const getScrollableContainer = () => {
    if (isEditOrderPage) {
      const scrollableContainer = document.querySelector('.search-results')
      return scrollableContainer
    }

    if (isSearchPage) {
      const scrollableContainer = document.querySelector(
        '.grid-layout__main-container',
      )
      return scrollableContainer
    }
  }

  if (!search.hits) {
    return null
  }

  const count = search.hits.length
  const shouldShowMessage = count > 0 && withMessage

  return (
    <div className="search-results" data-testid="search-results">
      {search.hits.length > 0 && (
        <div className="search-results__skip-link-container">
          <FocusedElement innerRef={setFocusRef}>
            <button className="search-results__skip-link" onClick={goToResults}>
              {t('accessibility.go_to_search_results')}
            </button>
          </FocusedElement>
          <button className="search-results__skip-link" onClick={goToFilters}>
            {t('accessibility.filter_results')}
          </button>
        </div>
      )}
      {shouldShowMessage && (
        <>
          <FocusedElement innerRef={setShowingResultsFocusRef}>
            <p className="subhead1-b search-results__header">
              {t(getResultTranslation(count, search.query))}
            </p>
          </FocusedElement>
        </>
      )}
      <ProductSection
        products={search.hits}
        noResultsComponent={SearchNoResults}
        source={SOURCES.SEARCH}
        sourceCode={SOURCE_CODES.SEARCH}
        layout={LAYOUTS.GRID}
      />
    </div>
  )
}

SearchResults.propTypes = {
  withMessage: bool,
  search: shape({
    query: string,
    hits: array,
  }).isRequired,
  t: func.isRequired,
}

SearchResults.defaultProps = {
  withMessage: false,
}

const ComposedSearchResults = compose(withTranslate)(SearchResults)

export { ComposedSearchResults as SearchResults }

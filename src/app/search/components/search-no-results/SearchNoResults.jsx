import { useEffect } from 'react'

import { withTranslate } from '../../../i18n/containers/i18n-provider'
import searchNoResultsImage from './assets/search@2x.png'
import PropTypes from 'prop-types'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { useSearchParam } from 'hooks/useSearchParam'
import { URL_PARAMS } from 'pages/paths'

import './styles/SearchNoResults.css'

const SearchNoResults = ({ t }) => {
  const { setFocusRef, focusOnElement } = useAccessibilityFocus({
    initialFocus: false,
  })

  const [searchParamFocusOnDetail] = useSearchParam(URL_PARAMS.FOCUS_ON_DETAIL)

  useEffect(() => {
    if (searchParamFocusOnDetail === 'search') {
      focusOnElement()
    }
  }, [focusOnElement, searchParamFocusOnDetail])

  return (
    <div className="search-no-results">
      <img
        className="search-no-results__image"
        alt=""
        src={searchNoResultsImage}
      />
      <FocusedElement innerRef={setFocusRef}>
        <p className="search-no-results__title title2-b">
          {t('no_results.default')}
        </p>
      </FocusedElement>
    </div>
  )
}

SearchNoResults.propTypes = {
  t: PropTypes.func.isRequired,
}

const SearchNoResultsWithTranslate = withTranslate(SearchNoResults)

export { SearchNoResultsWithTranslate as SearchNoResults }

import { useEffect } from 'react'

import { withTranslate } from '../../../i18n/containers/i18n-provider'
import CategoriesFilterCollapse from '../categories-filter-collapse'
import { array, func, object } from 'prop-types'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { useSearchParam } from 'hooks/useSearchParam'
import { URL_PARAMS } from 'pages/paths'

import './styles/CategoriesFilter.css'

const CategoriesFilter = ({
  categories,
  selectedCategory,
  selectCategory,
  t,
}) => {
  const [searchParamFocusOnDetail] = useSearchParam(URL_PARAMS.FOCUS_ON_DETAIL)

  const {
    setFocusRef: categoryHeaderRef,
    focusOnElement: focusOnCategoryHeader,
  } = useAccessibilityFocus({
    initialFocus: false,
  })

  useEffect(() => {
    if (searchParamFocusOnDetail === 'filters') {
      focusOnCategoryHeader()
    }
    // Only the search param dependency is necessary, as adding the other dependencies
    // will make the focus move to the category header when search results are re-rendered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamFocusOnDetail])

  if (!categories.length) {
    return null
  }

  return (
    <div
      className="categories-filter"
      data-testid="categories-filter"
      aria-label={t('accessibility.filter_by_category')}
    >
      <FocusedElement innerRef={categoryHeaderRef}>
        <p className="body1-sb">{t('search_bar_categories_title')}</p>
      </FocusedElement>
      <CategoriesFilterCollapse
        categories={categories}
        selectedCategory={selectedCategory}
        selectCategory={selectCategory}
      />
    </div>
  )
}

CategoriesFilter.propTypes = {
  categories: array.isRequired,
  selectedCategory: object,
  selectCategory: func,
  t: func.isRequired,
}

export const PlainCategoriesFilter = CategoriesFilter

export default withTranslate(CategoriesFilter)

import { useEffect } from 'react'
import { useHistory } from 'react-router'

import { string } from 'prop-types'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { useSearchParam } from 'hooks/useSearchParam'
import { useSearchParams } from 'hooks/useSearchParams'
import { URL_PARAMS } from 'pages/paths'

export const CategoryDetailTitle = ({ categoryName }) => {
  const { setFocusRef, focusOnElement } = useAccessibilityFocus({
    initialFocus: false,
  })

  const [searchParamFocusOnDetail] = useSearchParam(URL_PARAMS.FOCUS_ON_DETAIL)

  const { searchParams } = useSearchParams()

  const history = useHistory()

  useEffect(() => {
    if (searchParamFocusOnDetail === 'category') {
      focusOnElement()
      setTimeout(() => {
        const newParams = new URLSearchParams(searchParams)
        newParams.delete(URL_PARAMS.FOCUS_ON_DETAIL)

        history.replace({ ...location, search: newParams.toString() })
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOnElement, searchParamFocusOnDetail])

  return (
    <FocusedElement innerRef={setFocusRef}>
      <h1 id="content" className="category-detail__title title1-b">
        {categoryName}
      </h1>
    </FocusedElement>
  )
}

CategoryDetailTitle.propTypes = {
  categoryName: string,
}

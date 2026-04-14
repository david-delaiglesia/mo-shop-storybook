import { useRef, useState } from 'react'
import { useLocation } from 'react-router'

import { func, string } from 'prop-types'

import { useClickOut } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { SORTING_METHODS } from 'app/my-regulars/constants'
import { sendMyRegularsSortingMethodClickMetrics } from 'app/my-regulars/metrics'
import { URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Storage } from 'services/storage/storage.js'

import './styles/MyRegularsHeader.css'

const MyRegularsHeader = ({ sortingMethod, setSortingMethod, t }) => {
  const [open, setOpen] = useState(false)
  const firstMenuItem = useRef()
  const menuButton = useRef()
  const isShoppingListsTabsEnabled = useFlag(
    knownFeatureFlags.SHOPPING_LISTS_TABS,
  )

  const openSortingMenu = async () => {
    await setOpen((open) => !open)
    doFocus(firstMenuItem)
  }

  const selectItem = (sortingMethod) => {
    setSortingMethod(sortingMethod)
    setOpen(false)
    doFocus(menuButton)
    sendMyRegularsSortingMethodClickMetrics({
      sortingMethod,
    })

    Storage.setShoppingListDetailOrderBy('my-regulars', sortingMethod)
  }

  const doFocus = (reference) => {
    const element = reference.current
    if (!element) return
    element.focus()
  }

  const { refContainer } = useClickOut(() => setOpen(false), open)

  const location = useLocation()

  const shouldFocusOnHeader = !location.search.includes(
    `${URL_PARAMS.FOCUS_ON_DETAIL}=false`,
  )
  const { setFocusRef } = useAccessibilityFocus({
    initialFocus: shouldFocusOnHeader,
  })

  return (
    <div className="my-regulars-header">
      <span className="my-regulars-header__left">
        <FocusedElement innerRef={setFocusRef}>
          <h1 className="my-regulars-header__title title1-b">
            {t('my_products.header')}
          </h1>
        </FocusedElement>
        {!isShoppingListsTabsEnabled && (
          <p className="my-regulars-header__subtitle body1-r">
            {t('my_products.message')}
          </p>
        )}
      </span>
      <div className="my-regulars-header__actions">
        <div className="my-regulars-header__menu-wrapper">
          <button
            ref={menuButton}
            onClick={openSortingMenu}
            aria-haspopup="true"
            aria-expanded={open}
            className="caption1-sb my-regulars-header__menu-button"
          >
            {t('product_sorting_title')} {t(sortingMethod)}
            <Icon icon="chevron-down" />
          </button>
          {open && (
            <ul
              role="menu"
              className="my-regulars-header__menu"
              ref={refContainer}
            >
              <li
                role="menuitem"
                className="subhead1-r my-regulars-header__menu-item"
              >
                <button
                  ref={firstMenuItem}
                  onClick={() => selectItem(SORTING_METHODS.BY_IMPORTANCE)}
                >
                  {t(SORTING_METHODS.BY_IMPORTANCE)}
                </button>
              </li>
              <li
                role="menuitem"
                className="subhead1-r my-regulars-header__menu-item"
              >
                <button onClick={() => selectItem(SORTING_METHODS.BY_CATEGORY)}>
                  {t(SORTING_METHODS.BY_CATEGORY)}
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <hr className="my-regulars-header__separator" aria-hidden="true" />
    </div>
  )
}

MyRegularsHeader.propTypes = {
  t: func.isRequired,
  sortingMethod: string.isRequired,
  setSortingMethod: func.isRequired,
}

const ComposedMyRegularsHeader = withTranslate(MyRegularsHeader)

export { ComposedMyRegularsHeader as MyRegularsHeader }

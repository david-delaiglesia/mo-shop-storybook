import { useRef } from 'react'
import { useRouteMatch } from 'react-router'

import { func, object, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { useSearchParams } from 'hooks/useSearchParams'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { TAB_INDEX } from 'utils/constants'
import withEnterKeyPress from 'wrappers/enter-key-press'

import './SearchBox.css'

const SearchBox = ({
  searchValue = '',
  onChange,
  onEnterKeyPress,
  onClose,
  t,
  inputRef: providedInputRef,
}) => {
  const { addSearchParam } = useSearchParams()
  const defaultInputRef = useRef()
  const inputRef = providedInputRef ? providedInputRef : defaultInputRef

  const isEditOrderPage = useRouteMatch({ path: PATHS.EDIT_ORDER_PRODUCTS })

  const focusOnMyOrderTitle = () => {
    const editOrderTitleRef = document.getElementById('edit-order-title')
    editOrderTitleRef?.focus()
  }

  const handleOnFocus = (event) => {
    const isTabPressed = event.key === 'Tab'
    const isShiftTabPressed = isTabPressed && event.shiftKey
    const shouldFocusOnMyOrder =
      !event.target.value && isTabPressed && isEditOrderPage
    const shouldFocusOnSearchResults = event.target.value && isTabPressed

    if (isShiftTabPressed) {
      return
    }

    if (shouldFocusOnMyOrder) {
      focusOnMyOrderTitle()

      return
    }

    if (shouldFocusOnSearchResults) {
      addSearchParam(URL_PARAMS.FOCUS_ON_DETAIL, 'search')

      return
    }

    return
  }

  return (
    <div className="search">
      <span
        onClick={() => {
          inputRef?.current?.focus()
        }}
        className="search__button"
        data-testid="search-lens-element-id"
      >
        <Icon icon="search-28" alt="" />
      </span>
      <input
        id="search"
        tabIndex={TAB_INDEX.ENABLED}
        name="search"
        role="searchbox"
        aria-label={t('header.search')}
        className="body1-r search__input"
        placeholder={t('header.search')}
        value={searchValue}
        onChange={onChange}
        onKeyDown={handleOnFocus}
        spellCheck={false}
        autoComplete="off"
        onKeyPress={onEnterKeyPress}
        data-testid="search-input"
        ref={inputRef}
      />
      {!!searchValue && (
        <span
          onClick={onClose}
          className="search__close"
          data-testid="search-close-element-id"
        >
          <Icon icon="cross-28" />
        </span>
      )}
    </div>
  )
}

SearchBox.propTypes = {
  searchValue: string,
  onChange: func.isRequired,
  onEnterKeyPress: func,
  onClose: func.isRequired,
  t: func.isRequired,
  inputRef: object,
}

const ComposedSearchBox = compose(withTranslate, withEnterKeyPress)(SearchBox)
export { ComposedSearchBox as SearchBox }

import { useState } from 'react'

import { func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { SORTING_METHODS } from 'app/cart/constants'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { DropdownWithClickOut } from 'components/dropdown'
import { TAB_INDEX } from 'utils/constants'

import './SortCartProductDropdown.css'

const SortCartProductDropdown = ({ t, onChange, className }) => {
  const [openDropDown, setOpenDropDown] = useState(false)
  const [sortingMethod, setSortingMethod] = useState(SORTING_METHODS.TIME)

  const sortProductsAriaLabel = `${t('accessibility.sorting_cart_menu_title')} ${t(sortingMethod)}`

  const closeDropdown = () => setOpenDropDown(false)
  const toggleDropdown = () => setOpenDropDown(!openDropDown)

  const updateSortingMethod = (method) => {
    setSortingMethod(method)
    onChange(method)
    closeDropdown()
  }

  const dropDownHeader = (
    <div className="sorting-method__selector caption2-sb">
      <p className="caption2-sb selector__text">{t(`${sortingMethod}`)}</p>
      <Icon icon={'chevron-down'} />
    </div>
  )

  const dropDownContent = (
    <ul
      tabIndex={TAB_INDEX.ENABLED}
      role="menu"
      className="sorting-method__options"
    >
      <li
        role="menuitem"
        tabIndex={TAB_INDEX.ENABLED}
        className="footnote1-r sorting-method__option"
        onClick={() => updateSortingMethod(SORTING_METHODS.TIME)}
      >
        {t('product_sorting_by_time')}
      </li>
      <li
        role="menuitem"
        tabIndex={TAB_INDEX.ENABLED}
        className="footnote1-r sorting-method__option"
        onClick={() => updateSortingMethod(SORTING_METHODS.CATEGORY)}
      >
        {t('product_sorting_by_category')}
      </li>
    </ul>
  )

  return (
    <div tabIndex={TAB_INDEX.ENABLED} className={className}>
      <span aria-hidden={true} className="sorting-method__title">
        {t('product_sorting_title')}
      </span>

      <DropdownWithClickOut
        ariaLabel={sortProductsAriaLabel}
        handleClickOutside={closeDropdown}
        header={dropDownHeader}
        content={dropDownContent}
        open={openDropDown}
        toggleDropdown={toggleDropdown}
        datatest="cart-sorting-method-selector"
      />
    </div>
  )
}

SortCartProductDropdown.propTypes = {
  t: func.isRequired,
  onChange: func.isRequired,
  className: string,
}

const SortCartProductDropdownWithTranslate = withTranslate(
  SortCartProductDropdown,
)

export { SortCartProductDropdownWithTranslate as SortCartProductDropdown }

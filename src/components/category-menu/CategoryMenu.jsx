import { useState } from 'react'
import { useSelector } from 'react-redux'
import { matchPath } from 'react-router'
import { useLocation, withRouter } from 'react-router-dom'

import classNames from 'classnames'
import { array, func, number, object, shape } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'
import { CategoryIcon } from '@mercadona/mo.library.shop-ui/icon/CategoryIcon'

import { FocusedElement, useAccessibilityFocus } from 'app/accessibility'
import { sendCategoryClickMetrics } from 'app/catalog/metrics'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { interpolatePath } from 'pages/routing'

import './styles/CategoryMenu.css'

const CategoryMenu = ({
  categories,
  categoryId,
  onCategoryChanged,
  onSubcategoryChanged,
  history,
  refContainer,
}) => {
  const { editingOrder } = useSelector((state) => state.ui.productModal)

  const location = useLocation()

  const { setFocusRef } = useAccessibilityFocus()

  const [isCategorySelected, setIsCategorySelected] = useState(false)

  const isCategoryOpen = ({ id, categories }) => {
    const isCurrentCategory = id === categoryId
    const isSubcategoryOfCurrentCategory =
      categories && categories.some((category) => category.id === categoryId)
    return isCurrentCategory || isSubcategoryOfCurrentCategory
  }

  const selectCategory = (category) => {
    const { id, name, categories } = category

    sendCategoryClickMetrics({ id, name })

    if (editingOrder) {
      onCategoryChanged(category)
      return
    }

    const { id: firstSubcategoryId } = categories[0]
    const path = interpolatePath(PATHS.CATEGORY, { id: firstSubcategoryId })
    history.push(path)

    setIsCategorySelected(true)
  }

  const selectSubCategory = (category) => {
    const { id, name } = category

    sendCategoryClickMetrics({ id, name })

    if (editingOrder) {
      onSubcategoryChanged(category)
      return
    }

    const path = interpolatePath(PATHS.CATEGORY, { id })
    const params = new URLSearchParams(location.search)

    params.set(URL_PARAMS.FOCUS_ON_DETAIL, 'category')
    history.push(`${path}?${params.toString()}`)
  }

  const getCategoryItemClassNames = (category) => {
    return classNames('category-menu__item', {
      open: isCategoryOpen(category),
    })
  }

  const getCategoryClassName = (currentCategoryId) => {
    const isOpenedCategory = currentCategoryId === categoryId
    return classNames('category-menu__header', {
      'category-menu__header--selected': isOpenedCategory,
    })
  }

  const getSubCategoryClassName = (currentCategoryId) => {
    const isOpenedCategory = currentCategoryId === categoryId
    return classNames('subhead1-r category-item', {
      'category-item--selected': isOpenedCategory,
    })
  }

  const getChevronIcon = (category) => {
    if (isCategoryOpen(category)) return 'chevron-down'
    return 'chevron-right'
  }

  const getCategoryRef = (index) => {
    const params = new URLSearchParams(location.search)
    const hasFocusOnFirstCategory = params.get(URL_PARAMS.FOCUS_ON_CATEGORY)
    const shouldFocusOnFirstCategory =
      index === 0 &&
      (!matchPath(location.pathname, PATHS.EDIT_ORDER_PRODUCTS) ||
        hasFocusOnFirstCategory)

    if (shouldFocusOnFirstCategory) {
      return setFocusRef
    }

    return null
  }

  const { setFocusRef: setSubCategoryFocusRef } = useAccessibilityFocus()

  const getSubCategoryFocusRef = (index) => {
    if (index === 0 && isCategorySelected) {
      return setSubCategoryFocusRef
    }

    return null
  }

  return (
    <ul className="category-menu" ref={refContainer}>
      {categories.map((category, index) => (
        <li className={getCategoryItemClassNames(category)} key={category.id}>
          <div className="collapse">
            <button onClick={() => selectCategory(category)}>
              <span className={getCategoryClassName(category.id)}>
                <Icon
                  className="category__collapse-icon"
                  icon={getChevronIcon(category)}
                />
                <CategoryIcon category={category.id} />
                <FocusedElement innerRef={getCategoryRef(index)}>
                  <label className="subhead1-r">{category.name}</label>
                </FocusedElement>
              </span>
            </button>
            <ul>
              {isCategoryOpen(category) &&
                category.categories.map((subcategory, index) => (
                  <li
                    key={subcategory.id}
                    className={getSubCategoryClassName(subcategory.id)}
                  >
                    <FocusedElement innerRef={getSubCategoryFocusRef(index)}>
                      <button
                        id={subcategory.id}
                        onClick={() => selectSubCategory(subcategory)}
                        className="category-item__link"
                      >
                        {subcategory.name}
                      </button>
                    </FocusedElement>
                  </li>
                ))}
            </ul>
          </div>
        </li>
      ))}
      <span className="category-menu__inset"></span>
    </ul>
  )
}

CategoryMenu.propTypes = {
  categories: array.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
  categoryId: number,
  onCategoryChanged: func,
  onSubcategoryChanged: func,
  refContainer: object,
}

const ComposedCategoryMenu = withRouter(CategoryMenu)

export { ComposedCategoryMenu as CategoryMenu }

import { Component } from 'react'

import CategoriesFilterCollapse from '../categories-filter-collapse'
import { func, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import './styles/CategoriesFilterItem.css'

class CategoriesFilterItem extends Component {
  constructor() {
    super()

    this.selectCategory = this.selectCategory.bind(this)
    this.hasSelectedChild = this.hasSelectedChild.bind(this)
  }

  getStatusClass(category) {
    const className = `categories-level-${category.level}`

    if (this.isSelected(category)) {
      return `${className} ${className}--selected`
    }
    if (this.isVisible(category)) {
      return `${className} ${className}--visible`
    }

    return className
  }

  isVisible(category) {
    if (!category.categories) {
      return false
    }
    return !!category.categories.find(this.hasSelectedChild)
  }

  hasSelectedChild(childCategory) {
    if (!childCategory) {
      return false
    }
    if (this.isSelected(childCategory)) {
      return true
    }

    const isLeafNode = !childCategory.categories
    if (isLeafNode) {
      return false
    }

    return childCategory.categories.find((leafCategory) =>
      this.isSelected(leafCategory),
    )
  }

  isSelected(category) {
    const { selectedCategory } = this.props
    if (!selectedCategory) {
      return false
    }

    return category.id === selectedCategory.id
  }

  selectCategory() {
    const { category, selectCategory } = this.props
    selectCategory(category)
  }

  handleCategoryKeyPressed = (event) => {
    if (event.key === 'Enter') {
      this.selectCategory()
    }
  }

  render() {
    const { category, selectedCategory, selectCategory } = this.props
    const isLeafNode = category.level === 2

    return (
      <li className={`categories-filter-item ${this.getStatusClass(category)}`}>
        <button
          aria-expanded={this.isSelected(category)}
          className="categories-filter-item__title"
          onClick={this.selectCategory}
        >
          {!isLeafNode && <Icon icon="disclosure-right" />}
          <span onKeyDown={this.handleCategoryKeyPressed}>{category.name}</span>
        </button>

        <CategoriesFilterCollapse
          categories={category.categories}
          selectCategory={selectCategory}
          selectedCategory={selectedCategory}
        />
      </li>
    )
  }
}

CategoriesFilterItem.propTypes = {
  category: object.isRequired,
  selectedCategory: object,
  selectCategory: func,
}

export default CategoriesFilterItem

import CategoriesFilterItem from '../categories-filter-item'
import { array, func, object } from 'prop-types'

import './styles/CategoriesFilterCollapse.css'

const CategoriesFilterCollapse = ({
  categories,
  selectedCategory,
  selectCategory,
}) => {
  if (!categories) {
    return null
  }

  return (
    <ul className="categories-filter-collapse">
      {categories.map((category) => (
        <CategoriesFilterItem
          key={category.id}
          category={category}
          selectedCategory={selectedCategory}
          selectCategory={selectCategory}
        />
      ))}
    </ul>
  )
}

CategoriesFilterCollapse.propTypes = {
  categories: array,
  selectedCategory: object,
  selectCategory: func,
}

export default CategoriesFilterCollapse

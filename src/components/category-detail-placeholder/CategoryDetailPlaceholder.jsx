import PropTypes from 'prop-types'

import './assets/CategoryDetailPlaceholder.css'

const CategoryDetailPlaceholder = () => (
  <div className="category-detail-placeholder">
    <div className="category-detail-placeholder__header">
      <span className="category-detail-placeholder__header-shape"></span>
    </div>
    <div className="category-detail-placeholder__title">
      <span className="category-detail-placeholder__title-shape"></span>
    </div>
    <CategorySectionPlaceHolder />
    <div className="category-detail-placeholder__title">
      <span className="category-detail-placeholder__title-shape"></span>
    </div>
    <CategorySectionPlaceHolder />
  </div>
)

const CategorySectionPlaceHolder = ({ numberCells }) => (
  <div className="category-detail-placeholder__content">
    {[...Array(numberCells)].map((x, i) => (
      <CategoryCellPlaceholder key={i} />
    ))}
  </div>
)

CategorySectionPlaceHolder.propTypes = {
  numberCells: PropTypes.number,
}

CategorySectionPlaceHolder.defaultProps = {
  numberCells: 7,
}

const CategoryCellPlaceholder = () => (
  <div className="category-cell-placeholder">
    <div className="category-cell-placeholder__image"></div>
    <div className="category-cell-placeholder__description"></div>
    <div className="category-cell-placeholder__format"></div>
    <div className="category-cell-placeholder__price"></div>
    <div className="category-cell-placeholder__add-to-cart"></div>
  </div>
)

export { CategoryDetailPlaceholder }

import { array, bool, number, string } from 'prop-types'

import { ProductSection } from 'app/catalog/components/product-section'
import { LAYOUTS, SOURCES, SOURCE_CODES } from 'app/catalog/metrics'

import './assets/CategorySection.css'

const CategorySection = ({
  name,
  description,
  image,
  isExtended,
  products,
  sectionPosition,
  sectionId,
  categoryId,
}) => {
  if (!isExtended) {
    return (
      <ProductSection
        products={products}
        name={name}
        source={SOURCES.CATEGORY}
        sourceCode={SOURCE_CODES.CATEGORIES}
        layout={LAYOUTS.GRID}
        sectionPosition={sectionPosition}
        sectionId={sectionId}
        categoryId={categoryId}
      />
    )
  }

  return (
    <div className="category-section">
      <div className="category-section__header">
        <div className="category-section__content">
          <h3 className="category-section__name title1-b">{name}</h3>
          <p className="category-section__description">{description}</p>
        </div>
        <div
          className="category-section__image"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      </div>

      <ProductSection
        products={products}
        source={SOURCES.CATEGORY}
        sourceCode={SOURCE_CODES.CATEGORIES}
        layout={LAYOUTS.GRID}
        sectionPosition={sectionPosition}
        sectionId={sectionId}
        categoryId={categoryId}
      />
    </div>
  )
}

CategorySection.propTypes = {
  name: string,
  description: string,
  image: string,
  isExtended: bool,
  products: array.isRequired,
  sectionPosition: number,
  sectionId: number,
  categoryId: number,
}

export default CategorySection

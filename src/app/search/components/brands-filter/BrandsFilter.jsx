import { withTranslate } from '../../../i18n/containers/i18n-provider'
import BrandsFilterItem from '../brands-filter-item'
import { array, func } from 'prop-types'

import { TAB_INDEX } from 'utils/constants'

import './styles/BrandsFilter.css'

const BrandsFilter = ({ brands, selectedBrands, selectBrand, t }) => {
  if (!brands.length) {
    return null
  }

  return (
    <div
      className="brands-filter"
      data-testid="brands-filter"
      aria-label={t('accessibility.filter_by_brand')}
    >
      <p className="body1-sb" tabIndex={TAB_INDEX.ENABLED}>
        {t('search_bar_brands_title')}
      </p>

      <ul>
        {brands.map((brand) => (
          <BrandsFilterItem
            key={brand}
            brand={brand}
            checked={selectedBrands.includes(brand)}
            selectBrand={selectBrand}
          />
        ))}
      </ul>
    </div>
  )
}

BrandsFilter.propTypes = {
  brands: array.isRequired,
  selectedBrands: array,
  selectBrand: func.isRequired,
  t: func.isRequired,
}

export const PlainBrandsFilter = BrandsFilter

export default withTranslate(BrandsFilter)

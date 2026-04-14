import { Component } from 'react'

import { bool, func, string } from 'prop-types'

import Checkbox from 'system-ui/checkbox'

import './styles/BrandsFilterItem.css'

class BrandsFilterItem extends Component {
  constructor() {
    super()

    this.selectBrand = this.selectBrand.bind(this)
  }

  selectBrand() {
    this.props.selectBrand(this.props.brand)
  }

  handleBrandKeyPressed = (event) => {
    if (event.key === 'Enter') {
      this.selectBrand()
    }
  }

  render() {
    const { brand, checked } = this.props

    return (
      <li
        className="brands-filter-item subhead1-r"
        onKeyDown={this.handleBrandKeyPressed}
      >
        <Checkbox checked={checked} label={brand} onChange={this.selectBrand} />
      </li>
    )
  }
}

BrandsFilterItem.propTypes = {
  brand: string,
  checked: bool,
  selectBrand: func.isRequired,
}

export default BrandsFilterItem

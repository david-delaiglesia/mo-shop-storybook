import { PureComponent } from 'react'

import { bool, func, number } from 'prop-types'

import './styles/BannerIndex.css'

class BannerIndex extends PureComponent {
  static STATUS = {
    DEFAULT: 'banner-index',
    SELECTED: 'banner-index--selected',
  }

  constructor() {
    super()

    this.onClick = this.onClick.bind(this)
  }

  onClick() {
    this.props.onClick(this.props.index)
  }

  getStyle() {
    if (this.props.isSelected) {
      return `${BannerIndex.STATUS.DEFAULT} ${BannerIndex.STATUS.SELECTED}`
    }

    return BannerIndex.STATUS.DEFAULT
  }

  render() {
    const { index } = this.props

    return (
      <div
        data-testid={`banner-index-${index}`}
        aria-hidden="true"
        className={this.getStyle()}
        onClick={this.onClick}
      ></div>
    )
  }
}

BannerIndex.propTypes = {
  index: number,
  isSelected: bool,
  onClick: func.isRequired,
}

export default BannerIndex

import BannerIndex from './BannerIndex'
import { func, number } from 'prop-types'

import './styles/BannerIndexList.css'

const BannerIndexList = ({ length, selected, clickOnIndex }) => {
  return (
    <div className="banner-index-list">
      {Array.from(Array(length), (value, index) => (
        <BannerIndex
          key={index}
          index={index}
          onClick={clickOnIndex}
          isSelected={selected === index}
        />
      ))}
    </div>
  )
}

BannerIndexList.propTypes = {
  length: number,
  selected: number,
  clickOnIndex: func,
}

export default BannerIndexList

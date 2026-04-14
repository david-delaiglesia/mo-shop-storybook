import { Link } from 'react-router-dom'

import PropTypes from 'prop-types'

import myRegularsImage from 'app/my-regulars/components/my-regulars-empty/assets/my-regulars-copy@2x.png'
import { PATHS } from 'pages/paths'

import './MyEssentialsItem.css'

const MyEssentialsItem = ({ t }) => {
  return (
    <Link
      to={PATHS.SHOPPING_LISTS_MY_REGULARS}
      className="shopping-list-my-essentials-item__wrapper"
    >
      <div className="shopping-list-my-essentials-item__image-wrapper">
        <img
          className="shopping-list-my-essentials-item__image"
          alt=""
          src={myRegularsImage}
        />
        <span className="product-cell__image-overlay"></span>
      </div>
      <div className="shopping-list-my-essentials-item__list-info">
        <div className="headline1-b shopping-list-my-essentials-item__title">
          {t('shopping_lists.my_essentials.title')}
        </div>
        <div className="subhead1-r shopping-list-my-essentials-item__quantity">
          {t('shopping_lists.my_essentials.description')}
        </div>
      </div>
    </Link>
  )
}

MyEssentialsItem.propTypes = {
  t: PropTypes.func,
}

export { MyEssentialsItem }

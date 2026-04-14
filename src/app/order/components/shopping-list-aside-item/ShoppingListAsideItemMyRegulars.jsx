import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import classNames from 'classnames'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import myRegularsImage from 'app/my-regulars/components/my-regulars-empty/assets/my-regulars-copy@2x.png'

import './ShoppingListAsideItemMyRegulars.css'

const ShoppingListAsideItemMyRegulars = () => {
  const { t } = useTranslation()
  const { search } = useLocation()

  const searchParams = new URLSearchParams(search)
  const isInShoppingListMyRegulars = searchParams.get(
    'shopping-list-my-regulars',
  )

  const wrapperClassNames = classNames(
    'shopping-list-aside-item-my-regulars__wrapper',
    {
      'shopping-list-aside-item-my-regulars__wrapper--selected':
        isInShoppingListMyRegulars,
    },
  )

  return (
    <FocusedElementWithInitialFocus>
      <Link to="?shopping-list-my-regulars=true" className={wrapperClassNames}>
        <div className="shopping-list-aside-item-my-regulars__image-wrapper">
          <img
            className="shopping-list-aside-item-my-regulars__image"
            alt=""
            src={myRegularsImage}
          />
          <span className="product-cell__image-overlay"></span>
        </div>
        <div className="shopping-list-aside-item-my-regulars__list-info">
          <div className="subhead1-b shopping-list-aside-item-my-regulars__title">
            {t('shopping_lists.my_essentials.title')}
          </div>
          <div className="footnote1-r shopping-list-aside-item-my-regulars__quantity">
            {t('shopping_lists.my_essentials.description')}
          </div>
        </div>
      </Link>
    </FocusedElementWithInitialFocus>
  )
}

export { ShoppingListAsideItemMyRegulars }

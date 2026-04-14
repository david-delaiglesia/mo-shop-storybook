import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link, matchPath, useLocation } from 'react-router-dom'

import classnames from 'classnames'

import { PATHS } from 'pages/paths'

import './ShoppingListsTabs.css'

interface ShoppingListsTabsProps {
  children: ReactNode
}

const ShoppingListsTabs = ({ children }: ShoppingListsTabsProps) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { isAuth } = useSelector(
    (state: { session: { isAuth: boolean } }) => state.session,
  )

  const isMyEssentialsActive = !!matchPath(pathname, {
    path: PATHS.SHOPPING_LISTS_MY_REGULARS,
    exact: true,
  })

  if (!isAuth) {
    return <>{children}</>
  }

  return (
    <div>
      <nav
        aria-label={t('shopping_lists.tabs.nav_label')}
        className="shopping-lists-tabs__nav"
      >
        <ul>
          <li>
            <Link
              aria-current={isMyEssentialsActive ? 'page' : undefined}
              className={classnames('shopping-lists-tabs__tab subhead1-sb', {
                'shopping-lists-tabs__tab--active': isMyEssentialsActive,
              })}
              to={PATHS.SHOPPING_LISTS_MY_REGULARS}
            >
              {t('my_products.header')}
            </Link>
          </li>
          <li>
            <Link
              aria-current={!isMyEssentialsActive ? 'page' : undefined}
              className={classnames('shopping-lists-tabs__tab subhead1-sb', {
                'shopping-lists-tabs__tab--active': !isMyEssentialsActive,
              })}
              to={PATHS.SHOPPING_LISTS}
            >
              {t('shopping_lists.title')}
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  )
}

export { ShoppingListsTabs }

import { withRouter } from 'react-router'
import { matchPath } from 'react-router-dom'

import { func } from 'prop-types'
import { compose } from 'redux'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { MenuItem } from 'components/menu-item'
import { PATHS } from 'pages/paths'
import { useFlag } from 'services/feature-flags'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { isTestingEnv } from 'utils/debug'

const isShoppingListsActive = (match, location) =>
  Boolean(
    matchPath(location.pathname, { path: PATHS.SHOPPING_LISTS, exact: true }) ||
    matchPath(location.pathname, {
      path: PATHS.SHOPPING_LISTS_MY_REGULARS,
      exact: true,
    }),
  )

const Menu = ({ t }) => {
  const isShoppingListsTabsEnabled = useFlag(
    knownFeatureFlags.SHOPPING_LISTS_TABS,
  )
  const shoppingListsPath = isShoppingListsTabsEnabled
    ? PATHS.SHOPPING_LISTS_MY_REGULARS
    : PATHS.SHOPPING_LISTS

  return (
    <nav className="menu" role="navigation">
      <MenuItem label={t('header.menu.categories')} link={PATHS.CATEGORIES} />
      {isTestingEnv() && <span>WEB-MIGRATION</span>}
      <MenuItem
        label={t('header.menu.shopping_lists')}
        link={shoppingListsPath}
        isActive={
          isShoppingListsTabsEnabled ? isShoppingListsActive : undefined
        }
      />
    </nav>
  )
}

Menu.propTypes = {
  t: func.isRequired,
}

const ComposedMenu = compose(withRouter, withTranslate)(Menu)

export { ComposedMenu as Menu }

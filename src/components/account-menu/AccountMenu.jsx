import { Fragment, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { bool, func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import {
  sendFAQClickMetrics,
  sendProfileViewMetrics,
} from 'app/authentication/metrics'
import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatHelpSources } from 'app/chat/metrics'
import { SelectDeliveryAreaContainer } from 'app/delivery-area/containers/select-delivery-area-container'
import { I18nClient } from 'app/i18n/client'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonV2 } from 'components/button'
import { PATHS, URL_PARAMS } from 'pages/paths'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Support } from 'services/support'
import { ACCOUNT_MENU_POSITION } from 'system-ui/constants'
import { getSupportLanguage } from 'utils/languages'

import './assets/AccountMenu.css'

const AccountMenu = ({
  toggleLogoutAlert,
  userName,
  cartHasProducts,
  closeDropdown,
  t,
}) => {
  const session = useSelector((state) => state.session)
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const chatContext = useChatContext()

  useEffect(() => {
    sendProfileViewMetrics()
  }, [])

  const openSupportChat = () => {
    if (!isActiveNewChat) {
      Support.openWidget()
      return
    }

    chatContext?.open(ChatHelpSources.USER_MENU)
  }

  const faqsUrl = `${Support.FAQS_URL}/hc/${getSupportLanguage(
    I18nClient.getCurrentLanguage(),
  )}`

  const authAccountMenu = (
    <Fragment>
      <Link
        className="subhead1-r account-menu__item"
        to={PATHS.USER_AREA_ORDERS}
      >
        <Icon icon="orders-28" />
        <span>{t('header.user_menu.menu.orders')}</span>
      </Link>
      <Link
        className="subhead1-r account-menu__item"
        to={PATHS.USER_AREA_PERSONAL_INFO}
      >
        <Icon icon="account-28" />
        <span>{t('header.user_menu.menu.account')}</span>
      </Link>
      <hr />
      <a
        href={faqsUrl}
        target="_blank"
        className="subhead1-r account-menu__item"
        rel="noopener noreferrer"
        onClick={sendFAQClickMetrics}
      >
        <Icon icon="faq-28" />
        <span>{t('header.user_menu.menu.faqs')}</span>
      </a>
      <button
        className="subhead1-r account-menu__item"
        onClick={openSupportChat}
      >
        <Icon icon="chat-28" />
        <span>{t('header.user_menu.menu.help')}</span>
      </button>
      <button
        className="subhead1-r account-menu__item"
        onClick={toggleLogoutAlert}
        data-testid="logout-button"
      >
        <Icon icon="logout-28" />
        <span>{t('header.user_menu.menu.close_session')}</span>
      </button>
    </Fragment>
  )

  const loginRoute = (location) => {
    const searchParams = new URLSearchParams(location.search)
    searchParams.set(URL_PARAMS.AUTHENTICATE_USER, '')
    return { pathname: location.pathname, search: searchParams.toString() }
  }

  const unauthAccoutMenu = (
    <Fragment>
      <div className="account-menu__sign-in">
        <ButtonV2.Primary
          as={Link}
          text="header.user_menu.menu.identify"
          to={loginRoute}
        />
      </div>
      <hr />
      <a
        href={faqsUrl}
        target="_blank"
        className="subhead1-r account-menu__item"
        rel="noopener noreferrer"
      >
        <Icon icon="faq-28" />
        <span>{t('header.user_menu.menu.faqs')}</span>
      </a>
      <button
        className="subhead1-r account-menu__item"
        onClick={openSupportChat}
      >
        <Icon icon="chat-28" />
        <span>{t('header.user_menu.menu.help')}</span>
      </button>
    </Fragment>
  )

  const top = { top: `${ACCOUNT_MENU_POSITION}px` }

  return (
    <div
      style={top}
      onClick={closeDropdown}
      className={`account-menu ${cartHasProducts && 'account-menu--left'}`}
      role="listbox"
    >
      <div className="account-menu__header">
        <h1 className="account-menu__title headline1-b ym-hide-content">
          {userName || t('header.user_menu.menu.anom')}
        </h1>
        <SelectDeliveryAreaContainer source="profile" />
      </div>
      <hr />
      {session.isAuth ? authAccountMenu : unauthAccoutMenu}
    </div>
  )
}

AccountMenu.propTypes = {
  toggleLogoutAlert: func.isRequired,
  userName: string,
  cartHasProducts: bool.isRequired,
  closeDropdown: func.isRequired,
  t: func.isRequired,
}

const AccountMenuWithTranslate = withTranslate(AccountMenu)

export { AccountMenuWithTranslate as AccountMenu }

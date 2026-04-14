import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import PropTypes from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { sendFAQClickMetrics } from 'app/authentication/metrics'
import { useUser } from 'app/user'
import { PATHS } from 'pages/paths'
import { Support } from 'services/support'
import { Invoice28Icon } from 'system-ui/icons'
import { getSupportLanguage } from 'utils/languages'

import './UserAreaMenu.css'

const { VITE_APP_VERSION } = import.meta.env

export const UserAreaMenu = ({ menu, toggleLogoutAlert }) => {
  const { t, i18n } = useTranslation()

  const { user } = useUser()

  const faqsUrl = `${Support.FAQS_URL}/hc/${getSupportLanguage(i18n.language)}`

  return (
    <aside className="user-area-wrapper">
      <ul className="user-area-menu">
        {menu.map((item) => (
          <li key={item.to} className="subhead1-r">
            <NavLink to={item.to} className="user-area-menu__item">
              <Icon icon={item.icon} />
              <span>{t(item.label)}</span>
            </NavLink>
          </li>
        ))}
        {user.has_active_billing && (
          <li className="subhead1-r">
            <NavLink
              to={PATHS.USER_AREA_INVOICES}
              className="user-area-menu__item"
            >
              <Invoice28Icon />
              <span>{t('user_area.menu.invoices')}</span>
            </NavLink>
          </li>
        )}
      </ul>
      <ul className="user-area-menu">
        <li className="subhead1-r">
          <a
            className="user-area-menu__item"
            href={faqsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={sendFAQClickMetrics}
          >
            <Icon icon="faq-28" />
            <span>{t('user_area.menu.faqs')}</span>
          </a>
        </li>
        <li className="subhead1-r">
          <button className="user-area-menu__item" onClick={toggleLogoutAlert}>
            <Icon icon="logout-28" />
            <span>{t('header.user_menu.menu.close_session')}</span>
          </button>
        </li>
      </ul>
      <span className="caption2-sb user-area-menu__version">
        {VITE_APP_VERSION}
      </span>
    </aside>
  )
}

UserAreaMenu.propTypes = {
  menu: PropTypes.array,
  toggleLogoutAlert: PropTypes.func.isRequired,
}

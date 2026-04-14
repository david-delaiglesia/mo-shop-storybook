import { useTranslation } from 'react-i18next'
import { matchPath, useLocation } from 'react-router-dom'

import { rootRoutes } from 'pages/routes'

import './SkipLink.css'

const SkipLinkToContent = () => {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const showSkipLink = matchPath(pathname, rootRoutes.HOME)

  if (showSkipLink) {
    return (
      <a className="skip-link" href="#content">
        {t('skip_link_content')}
      </a>
    )
  }

  return null
}

export { SkipLinkToContent }

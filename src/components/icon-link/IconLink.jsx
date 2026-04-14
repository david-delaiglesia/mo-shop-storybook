import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import classNames from 'classnames'
import { bool, func, string } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import './styles/IconLink.css'

const IconLink = ({
  text,
  pathname,
  className,
  datatest,
  onLinkClick,
  icon,
  hideText,
}) => {
  const { t } = useTranslation()

  const iconLinkClass = classNames('link', className)
  return (
    <Link
      className={iconLinkClass}
      to={pathname}
      onClick={onLinkClick}
      data-testid={datatest}
    >
      {!hideText && <span className="subhead1-sb">{t(text)}</span>}
      <Icon icon={icon} aria-hidden="true" />
    </Link>
  )
}

IconLink.propTypes = {
  pathname: string,
  text: string.isRequired,
  icon: string.isRequired,
  onLinkClick: func,
  datatest: string,
  className: string,
  hideText: bool,
}

IconLink.defaultProps = {
  datatest: 'link',
  pathname: '/',
  className: '',
}

export { IconLink }

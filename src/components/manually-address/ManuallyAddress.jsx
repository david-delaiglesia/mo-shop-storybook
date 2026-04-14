import { useTranslation } from 'react-i18next'

import classNames from 'classnames'
import PropTypes from 'prop-types'

import './ManuallyAddress.css'

export const ManuallyAddress = ({ id, isActive, onSelect, onHover }) => {
  const { t } = useTranslation()

  const handleListItemMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <li
      id={id}
      className={classNames('manually-address', {
        'manually-address--active': isActive,
      })}
      role="option"
      onMouseOver={onHover}
      onMouseDown={handleListItemMouseDown}
    >
      <div className="manually-address__content">
        <span className="manually-address__content__label subhead1-r">
          {t('address_manual_add_label')}
        </span>
        <span
          onMouseDown={onSelect}
          className="manually-address__content__action body1-sb"
        >
          {t('address_manual_add_button')}
        </span>
      </div>
    </li>
  )
}

ManuallyAddress.propTypes = {
  id: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onHover: PropTypes.func.isRequired,
}

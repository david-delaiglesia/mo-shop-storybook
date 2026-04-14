import { SuggestIcon } from './SuggestIcon'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import './Suggest.css'

export const Suggest = ({ suggest, isActive, ...props }) => {
  return (
    <li
      className={classNames('suggest', {
        'suggest--active': isActive,
      })}
      role="option"
      aria-label={`${suggest.primaryText} - ${suggest.secondaryText}`}
      {...props}
    >
      <SuggestIcon size={16} className="suggest__icon" aria-hidden />
      <div>
        <span className="suggest__primary-text subhead1-sb">
          {suggest.primaryText}
        </span>{' '}
        <span className="suggest__secondary-text subhead1-r">
          {suggest.secondaryText}
        </span>
      </div>
    </li>
  )
}

Suggest.propTypes = {
  suggest: PropTypes.shape({
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
}

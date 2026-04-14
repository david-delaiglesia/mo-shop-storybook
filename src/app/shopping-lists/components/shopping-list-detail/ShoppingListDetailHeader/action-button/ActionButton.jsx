import { func, string } from 'prop-types'

import { RoundedButton } from 'system-ui/rounded-button'

import './ActionButton.css'

const ActionButton = ({ label, icon, onClick }) => {
  return (
    <div className="shopping-list-detail-header__action-buttons-wrapper">
      <RoundedButton aria-label={label} Icon={icon} onClick={onClick} />
      <div
        className="shopping-list-detail-header__action-button-text-non-div body1-sb"
        onClick={onClick}
        aria-hidden={true}
      >
        {label}
      </div>
    </div>
  )
}

ActionButton.propTypes = {
  label: string.isRequired,
  icon: func.isRequired,
  onClick: func.isRequired,
}

export { ActionButton }

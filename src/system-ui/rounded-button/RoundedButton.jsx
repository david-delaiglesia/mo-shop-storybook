import { func, object, string } from 'prop-types'

import './RoundedButton.css'

const RoundedButton = ({ Icon, label, ...props }) => {
  return (
    <button
      className="rounded-button__button"
      aria-label={`${label} icon`}
      {...props}
    >
      <Icon />
    </button>
  )
}

RoundedButton.propTypes = {
  Icon: func,
  props: object,
  label: string,
}

export { RoundedButton }

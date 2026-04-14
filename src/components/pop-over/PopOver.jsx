import { useTranslation } from 'react-i18next'

import PropTypes from 'prop-types'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Icon } from '@mercadona/mo.library.shop-ui/icon/Icon'

import { withClickOutside } from 'wrappers/click-out-handler/ClickOutHandler'

import './assets/PopOver.css'

const PopOver = ({
  title,
  close,
  buttonText,
  message,
  buttonClick,
  arrowPosition,
}) => {
  const { t } = useTranslation()

  return (
    <div className={`pop-over pop-over--${arrowPosition}`}>
      <h3 className="pop-over__title subhead1-b">{title}</h3>
      <button
        className="pop-over__close"
        aria-label={t('alerts_close')}
        onClick={close}
      >
        <Icon icon="close" />
      </button>
      <p className="pop-over__message subhead1-r">{message}</p>
      {buttonText && (
        <Button
          aria-label="botón tooltip"
          className="pop-over__button"
          onClick={buttonClick}
          fullWidth
          size="small"
          variant="primary"
        >
          {buttonText}
        </Button>
      )}
    </div>
  )
}

PopOver.propTypes = {
  title: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  arrowPosition: PropTypes.string,
  message: PropTypes.string.isRequired,
  buttonClick: PropTypes.func,
  close: PropTypes.func,
}

PopOver.defaultProps = {
  arrowPosition: 'right',
}

export default PopOver

export const PopOverWithClickout = withClickOutside(PopOver)

import { func, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './CloseModalButton.css'

const CloseModalButton = ({ t, ...props }) => {
  return (
    <button
      aria-label={`${t('dialog_close')} modal`}
      className="ui-close-modal-button__button"
      {...props}
    >
      <Icon icon="close" />
    </button>
  )
}

CloseModalButton.propTypes = {
  t: func,
  props: object,
}

const CloseModalButtonWithTranslate = withTranslate(CloseModalButton)

export { CloseModalButtonWithTranslate as CloseModalButton }

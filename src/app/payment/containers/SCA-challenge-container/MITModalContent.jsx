import { Trans, useTranslation } from 'react-i18next'

import { Notifier } from '@mercadona/mo.library.shop-ui/notifier'

import { TAB_INDEX } from 'utils/constants'

const MITModalContent = () => {
  const { t } = useTranslation()

  return (
    <div className="mit-term-content">
      <Notifier icon="lock" variant="inline">
        {t('mit_term_reminder')}
      </Notifier>
      <p
        className="mit-term__description ui-medium-modal__description body1-r"
        tabIndex={TAB_INDEX.ENABLED}
      >
        <Trans>{'mit_term_explanation'}</Trans>
      </p>
    </div>
  )
}

export { MITModalContent }

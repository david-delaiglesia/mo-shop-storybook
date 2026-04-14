import mailImage from './assets/mail.png'
import { func } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import { TAB_INDEX } from 'utils/constants'

import './styles/ThankYou.css'

const ThankYou = ({ goToLandingPage, t }) => {
  return (
    <div className="thank-you" data-testid="thank-you">
      <img className="thank-you__mail-image" src={mailImage} alt="mail" />
      <h3 className="thank-you__title title2-b" tabIndex={TAB_INDEX.ENABLED}>
        {t('onbarding_notify_me_thanks_title')}
      </h3>
      <p
        className="thank-you__description body1-r"
        tabIndex={TAB_INDEX.ENABLED}
      >
        {t('onbarding_notify_me_thanks_description')}
      </p>
      <Button
        text="onboarding_notify_me_mercadona_es"
        datatest="thank-you-button"
        onClick={goToLandingPage}
      />
    </div>
  )
}

ThankYou.propTypes = {
  goToLandingPage: func.isRequired,
  t: func.isRequired,
}

const ComposedThankYou = withTranslate(ThankYou)

export { ComposedThankYou as ThankYou }

import { func, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import Button from 'components/button'
import logo from 'system-ui/assets/img/centered-logo.svg'
import { TAB_INDEX } from 'utils/constants'

import './styles/UnavailableArea.css'

const UnavailableArea = ({
  postalCode,
  goToTheClassicWeb,
  goToNotifyMe,
  enterAnotherPostalCode,
  t,
}) => {
  return (
    <div className="unavailable-area" data-testid="unavailable-area">
      <img className="unavailable-area__logo" src={logo} alt="logo" />
      <p className="unavailable-area__title" tabIndex={TAB_INDEX.ENABLED}>
        {t('onboarding_no_service_title', { postalCode })}
      </p>
      <Button
        className="unavailable-area__go-to-classic"
        datatest="go-to-classic-button"
        text="onboarding_no_service_classic_web_button"
        onClick={goToTheClassicWeb}
      />
      <Button
        className="unavailable-area__enter-another-postal-code"
        type="secondary"
        datatest="enter-another-postal-code-button"
        text="onboarding_no_service_new_postal_code_button"
        onClick={enterAnotherPostalCode}
      />
      <Button
        className="unavailable-area__notify-me footnote1-r"
        datatest="notify-me-button"
        text="onboarding_notify_me_link"
        onClick={goToNotifyMe}
      />
    </div>
  )
}

UnavailableArea.propTypes = {
  postalCode: string.isRequired,
  goToTheClassicWeb: func.isRequired,
  goToNotifyMe: func.isRequired,
  enterAnotherPostalCode: func.isRequired,
  t: func.isRequired,
}

const ComposedUnavailableArea = withTranslate(UnavailableArea)

export { ComposedUnavailableArea as UnavailableArea }

import { Component } from 'react'

import { ServiceRatingStep } from '../service-rating-step'
import checkIllustration from './assets/check-illustration.png'
import { func } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import { sendServiceRatingNotAvailableViewMetrics } from 'app/service-rating/metrics'
import Button from 'components/button'
import { TAB_INDEX } from 'utils/constants'

import './styles/NotAvailableStep.css'

class NotAvailableStep extends Component {
  componentDidMount() {
    sendServiceRatingNotAvailableViewMetrics()
  }

  render() {
    const { onFinish, t } = this.props

    return (
      <ServiceRatingStep>
        <div className="not-available-step" data-testid="not-available-step">
          <img
            className="not-available-step__illustration"
            src={checkIllustration}
            alt="Check icon"
          />
          <h3
            className="title-2-b-22 not-available-step__title"
            tabIndex={TAB_INDEX.ENABLED}
          >
            {t('service_rating_modal_not_available_title')}
          </h3>
          <Button
            className={'not-available-step__button'}
            text={t('service_rating_modal_not_available_button')}
            onClick={onFinish}
          />
        </div>
      </ServiceRatingStep>
    )
  }
}

NotAvailableStep.propTypes = {
  onFinish: func,
  t: func.isRequired,
}

const NotAvailableStepWithTranslate = withTranslate(NotAvailableStep)

export { NotAvailableStepWithTranslate as NotAvailableStep }

import { useEffect } from 'react'

import { ServiceRatingStep } from '../service-rating-step'
import checkIllustration from './assets/check-illustration.png'
import { array, bool, func, shape, string } from 'prop-types'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatHelpSources } from 'app/chat/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider/withTranslate'
import {
  sendServiceRatingAcmoChatClickMetrics,
  sendServiceRatingStepViewMetrics,
} from 'app/service-rating/metrics'
import Button from 'components/button'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Support } from 'services/support'
import { TAB_INDEX } from 'utils/constants'

import './styles/AcknowledgeStep.css'

const answersToString = (previousAnswers) =>
  previousAnswers.reduce(
    (acc, { answer }) => (acc ? `${acc} > ${answer}` : answer),
    '',
  )

const buildServiceRatingMessage = (orderId, previousAnswers, feedbackText) => {
  return `Id pedido: ${orderId} \n\n ${answersToString(
    previousAnswers,
  )} \n\n ${feedbackText}`
}

const openAcmoChatWithMessage = (message) => {
  Support.sendMessage(message)
  Support.popoutChatWindow()
}

const AcknowledgeStep = ({ step, onFinish, t }) => {
  const { title, previousAnswers, showChat, orderId, feedbackText, layout } =
    step
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const chatContext = useChatContext()

  useEffect(() => {
    const options = { layout }
    sendServiceRatingStepViewMetrics(options)
  }, [])

  const openChat = () => {
    const serviceRatingMessage = buildServiceRatingMessage(
      orderId,
      previousAnswers,
      feedbackText,
    )
    sendServiceRatingAcmoChatClickMetrics(previousAnswers)

    if (!isActiveNewChat) {
      openAcmoChatWithMessage(serviceRatingMessage)
    }

    if (isActiveNewChat) {
      chatContext?.open(ChatHelpSources.SERVICE_RATING, serviceRatingMessage)
    }

    onFinish()
  }

  return (
    <ServiceRatingStep>
      <div className="acknowledge-step" data-testid="acknowledge-step">
        <img
          className="acknowledge-step__illustration"
          src={checkIllustration}
          alt="Check icon"
        />
        <h3
          className="acknowledge-step__title headline1-b"
          tabIndex={TAB_INDEX.ENABLED}
        >
          {title}
        </h3>
        <Button
          className={'acknowledge-step__button'}
          text={t('service_rating_modal_not_available_button')}
          onClick={onFinish}
        />
        {showChat && (
          <button
            className="acknowledge-step__acmo-btn"
            onClick={openChat}
            data-testid="acmo-btn"
          >
            {t('service_rating_start_chat')}
          </button>
        )}
      </div>
    </ServiceRatingStep>
  )
}

AcknowledgeStep.propTypes = {
  step: shape({
    title: string.isRequired,
    showChat: bool,
    feedbackText: string,
    orderId: string,
    previousAnswers: array,
  }).isRequired,
  onFinish: func,
  t: func.isRequired,
}

const AcknowledgeStepWithTranslate = withTranslate(AcknowledgeStep)

export { AcknowledgeStepWithTranslate as AcknowledgeStep }

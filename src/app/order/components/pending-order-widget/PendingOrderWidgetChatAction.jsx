import { func, object } from 'prop-types'

import { useChatContext } from 'app/chat/contexts/useChatContext'
import { ChatMetrics } from 'app/chat/metrics'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { sendWidgetClickMetrics } from 'app/order/metrics'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import { Support } from 'services/support'

const PendingOrderWidgetChatAction = ({ order, t }) => {
  const isActiveNewChat = useFlag(knownFeatureFlags.NEW_SUPPORT_CHAT)
  const chatContext = useChatContext()

  const openChat = (event) => {
    event.stopPropagation()
    sendWidgetClickMetrics(order, 'chat')

    if (!isActiveNewChat) {
      Support.openWidget()
      return
    }

    chatContext?.open(ChatMetrics.ChatHelpSources.PENDING_ORDER)
  }

  return (
    <button
      className="pending-order-widget__action subhead1-sb"
      onClick={openChat}
    >
      {t('widget_chat_action')}
    </button>
  )
}

PendingOrderWidgetChatAction.propTypes = {
  order: object.isRequired,
  t: func.isRequired,
}

const PendingOrderWidgetChatActionWithTranslate = withTranslate(
  PendingOrderWidgetChatAction,
)

export { PendingOrderWidgetChatActionWithTranslate as PendingOrderWidgetChatAction }

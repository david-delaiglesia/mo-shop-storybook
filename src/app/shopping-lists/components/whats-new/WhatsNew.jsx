import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { AIImage } from './AIImage'
import { FastImage } from './FastImage'
import { ListHeartImage } from './ListHeartImage'

import { Modal } from '@mercadona/mo.library.shop-ui/modal'

import { useSession } from 'app/authentication'
import { ShoppingListsClient } from 'app/shopping-lists/infra/client'
import { ShoppingListsMetrics } from 'app/shopping-lists/infra/metrics.js'
import { PATHS } from 'pages/paths'

import './WhatsNew.css'

const WhatsNew = () => {
  const { t } = useTranslation()
  const [displayWhatsNewDialog, setDisplayWhatsNewDialog] = useState(false)
  const { uuid } = useSession()
  const history = useHistory()

  useEffect(() => {
    const getDisplayWhatsNew = async () => {
      if (!uuid) {
        return
      }

      const response = await ShoppingListsClient.fetchDisplayWhatsNew(uuid)
      setDisplayWhatsNewDialog(response?.showTooltip)
      if (response?.showTooltip) {
        ShoppingListsMetrics.whatsNewViewed()
      }
    }

    getDisplayWhatsNew()
  }, [uuid])

  if (!displayWhatsNewDialog) {
    return null
  }

  return (
    <Modal
      title={t('shopping_lists.whats_new.title')}
      primaryActionText={t('shopping_lists.whats_new.go_to_lists')}
      onPrimaryAction={() => {
        ShoppingListsMetrics.whatsNewNavigateToShoppingLists()
        history.push(PATHS.SHOPPING_LISTS)
      }}
      secondaryActionText={t('shopping_lists.whats_new.understood')}
      onSecondaryAction={() => {
        ShoppingListsMetrics.whatsNewUnderstood()
        setDisplayWhatsNewDialog(false)
      }}
      onClose={() => null}
      size="small"
    >
      <div className="whats-new__content">
        <div className="whats-new-advantages__wrapper">
          <ListHeartImage className="whats-new-advantages__image" />
          <div className="whats-new-advantages__info-wrapper">
            <div className="whats-new-advantages__info-title headline1-sb">
              {t('shopping_lists.whats_new.organise_title')}
            </div>
            <div className="whats-new-advantages__info-subtitle subhead1-r">
              {t('shopping_lists.whats_new.organise_subtitle')}
            </div>
          </div>
        </div>
        <div className="whats-new-advantages__wrapper">
          <FastImage className="whats-new-advantages__image" />
          <div className="whats-new-advantages__info-wrapper">
            <div className="whats-new-advantages__info-title headline1-sb">
              {t('shopping_lists.whats_new.save_time_title')}
            </div>
            <div className="whats-new-advantages__info-subtitle subhead1-r">
              {t('shopping_lists.whats_new.save_time_subtitle')}
            </div>
          </div>
        </div>
        <div className="whats-new-advantages__wrapper">
          <AIImage className="whats-new-advantages__image" />
          <div className="whats-new-advantages__info-wrapper">
            <div className="whats-new-advantages__info-title headline1-sb">
              {t('shopping_lists.whats_new.suggestions_title')}
            </div>
            <div className="whats-new-advantages__info-subtitle subhead1-r">
              {t('shopping_lists.whats_new.suggestions_subtitle')}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export { WhatsNew }

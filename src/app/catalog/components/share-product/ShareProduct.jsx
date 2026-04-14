import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { string } from 'prop-types'

import { sendShareProductMetrics } from 'app/product-detail/metrics'
import { IconLink } from 'components/icon-link'
import { createNotification } from 'containers/notifications-container/actions'
import { ProductPropTypes } from 'domain/product'
import { copyTextToClipboard } from 'libs/clipboard'

import './ShareProduct.css'

const ShareProduct = ({ product, datatest }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const uuid = crypto.randomUUID()

  const copyURL = (event) => {
    event.preventDefault()
    sendShareProductMetrics(product)
    copyTextToClipboard(product.shareUrl)
    dispatch(createNotification({ uuid, text: t('snackbar_share_message') }))
  }

  return (
    <IconLink
      className="link--reverse share-product"
      icon="share"
      text="share_button"
      product={product}
      onLinkClick={copyURL}
      datatest={datatest}
    />
  )
}

ShareProduct.propTypes = {
  product: ProductPropTypes.isRequired,
  datatest: string,
}

export { ShareProduct }

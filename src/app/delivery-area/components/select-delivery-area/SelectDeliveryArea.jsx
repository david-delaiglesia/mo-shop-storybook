import { func, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

import './styles/SelectDeliveryArea.css'

const SelectDeliveryArea = ({ postalCode, openDeliveryArea, datatest, t }) => {
  return (
    <button
      className="subhead1-r select-delivery-area"
      data-testid={datatest}
      onClick={openDeliveryArea}
      aria-label={t('accessibility.delivery_postal_code', { postalCode })}
    >
      {`${t('cart.delivery_postal_code')} ${postalCode}`}
    </button>
  )
}

SelectDeliveryArea.propTypes = {
  postalCode: string,
  openDeliveryArea: func.isRequired,
  datatest: string,
  t: func.isRequired,
}

SelectDeliveryArea.defaultProps = {
  datatest: 'select-delivery-area',
}

const ComposedSelectDeliveryArea = withTranslate(SelectDeliveryArea)

export { ComposedSelectDeliveryArea as SelectDeliveryArea }

import { useTranslation } from 'react-i18next'

import { Loader } from '@mercadona/mo.library.shop-ui/loader'

import { TAB_INDEX } from 'utils/constants'

import './styles/AddressConfirmationModalLabel.css'

interface AddressConfirmationModalLabelProps {
  isMoving: boolean
  isIdle: boolean
  isFirstRender: boolean
  selectedLocation: {
    street: string
    number: string
    postal_code: string
    town: string
  } | null
}

export const AddressConfirmationModalLabel = ({
  isMoving,
  isIdle,
  isFirstRender,
  selectedLocation,
}: AddressConfirmationModalLabelProps) => {
  const { t } = useTranslation()

  if (!isFirstRender && !isMoving && selectedLocation === null) {
    return <></>
  }

  return (
    <div
      className="address-confirmation-modal-label"
      role="status"
      aria-live="polite"
      aria-atomic
      tabIndex={TAB_INDEX.ENABLED}
    >
      <div className="address-confirmation-modal-label__info">
        {!isMoving && !isIdle && (
          <p className="footnote1-b">{t('address_map.label')}</p>
        )}
        {isMoving && <Loader ariaLabel="loader" />}
        {!isMoving && selectedLocation && (
          <>
            <span className="sr-only">
              {t('address_map.pin_at')} {selectedLocation.street}{' '}
              {selectedLocation.number}{' '}
            </span>
            <p className="footnote1-b">
              {selectedLocation.postal_code}, {selectedLocation.town}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

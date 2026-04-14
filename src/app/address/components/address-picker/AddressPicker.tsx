import { useTranslation } from 'react-i18next'

import { AddressPickerCell } from '../address-picker-cell'
import classNames from 'classnames'

import { Button } from '@mercadona/mo.library.shop-ui/button'
import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { Address } from 'app/address/interfaces'
import { isEmptyObject } from 'utils/objects'
import { isNullish } from 'utils/values'

import './styles/AddressPicker.css'

interface AddressPickerProps {
  waitingApiResponse: boolean
  addresses?: Array<Address>
  title?: string
  showShadow?: boolean
  showMargins?: boolean
  selectAddress: (address: Address) => void
  selectedAddress?: Address | null
  showForm: () => void
  closeList: () => void
  confirmAddress: () => void
}

export const AddressPicker = ({
  waitingApiResponse,
  addresses = [],
  title,
  showShadow,
  selectAddress,
  selectedAddress,
  showForm,
  showMargins,
  closeList,
  confirmAddress,
}: AddressPickerProps) => {
  const { t } = useTranslation()

  const className = classNames('address-picker', {
    'address-picker--shadow': showShadow,
    'address-picker--margins': showMargins,
  })

  const disableSaveButton = addresses.every(
    (address) => address.id !== selectedAddress?.id,
  )

  const disableCancelButton =
    isNullish(selectedAddress) || isEmptyObject(selectedAddress)

  return (
    <div className={className} data-testid="address-picker">
      <p className="address-picker-title body1-r">{title ? t(title) : null}</p>
      {!waitingApiResponse && (
        <div className="address-picker-addresses">
          {addresses.map((address) => (
            <AddressPickerCell
              key={address.id}
              address={address}
              selectAddress={selectAddress}
              selectedAddress={selectedAddress}
            />
          ))}
          <button
            className="subhead1-sb address-picker__add-button"
            onClick={showForm}
            data-testid="add-delivery-address"
          >
            <Icon icon="plus-28" />
            <span>
              {t('commons.order.order_delivery.address_list.add_address')}
            </span>
          </button>
        </div>
      )}
      <div className="address-picker-buttons">
        <Button
          variant="secondary"
          size="small"
          className="address-picker__cancel-button"
          onClick={closeList}
          data-testid="address-cancel-button"
          disabled={disableCancelButton}
        >
          {t('button.cancel')}
        </Button>
        <Button
          variant="primary"
          size="small"
          onClick={confirmAddress}
          disabled={disableSaveButton}
          data-testid="address-save-button"
        >
          {t('button.accept')}
        </Button>
      </div>
    </div>
  )
}

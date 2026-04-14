import classNames from 'classnames'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { Address } from 'app/address/interfaces'

import './styles/AddressPickerCell.css'

interface AddressPickerCellProps {
  address: Address
  selectAddress: (address: Address) => void
  selectedAddress?: Address | null
}

export const AddressPickerCell = ({
  address,
  selectAddress,
  selectedAddress,
}: AddressPickerCellProps) => {
  const isAddressSelected = selectedAddress?.id === address.id
  const checkClass = classNames('address-picker-cell__check', {
    active: isAddressSelected,
  })
  const selectAddressCell = () => selectAddress(address)

  return (
    <button
      className="address-picker-cell"
      data-testid="address-picker-cell"
      onClick={selectAddressCell}
    >
      <Icon icon="pin-28" />
      <div className="address-picker-cell__address-wrapper subhead1-r ym-hide-content">
        <span>{address.address}</span>
        {address.detail && (
          <span className="address-picker-cell__detail">{address.detail}</span>
        )}
        <p className="address-picker-cell__address-town">
          <span className="address-picker-cell__postal-code">
            {address.postalCode}
          </span>
          <span className="address-picker-cell__town">{address.town}</span>
        </p>
      </div>
      <div className={checkClass}>
        {isAddressSelected && (
          <Icon icon="check-28" data-testid="address-picker-selected" />
        )}
      </div>
    </button>
  )
}

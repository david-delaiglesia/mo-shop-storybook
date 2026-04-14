import { PinIcon } from '@mercadona/mo.library.icons'

import { type Address } from 'app/address/interfaces'
import { ElementCell } from 'app/user/components/element-cell'
import { TAB_INDEX } from 'utils/constants'

import './AddressCell.css'

export interface AddressCellProps {
  address: Pick<
    Address,
    'address' | 'comments' | 'detail' | 'permanent' | 'postalCode' | 'town'
  >
  onDeleteAddress: () => void
  onPermanentAddress: () => void
}

export const AddressCell = ({
  address,
  onDeleteAddress,
  onPermanentAddress,
}: AddressCellProps) => {
  return (
    <ElementCell
      isDefault={address.permanent}
      onSetDefault={onPermanentAddress}
      onDelete={onDeleteAddress}
    >
      <div className="address-cell__info" tabIndex={TAB_INDEX.ENABLED}>
        <span className="address-cell__pin-icon">
          <PinIcon size={24} aria-hidden />
        </span>
        <div className="address-cell__data ym-hide-content">
          <h3 className="body1-sb address-cell__street">
            {address.address}
            {'. '}
            {address.detail}
          </h3>
          <p className="address-cell__details">
            <span className="subhead1-r">{address.postalCode}</span>
            {address.town && (
              <span className="subhead1-r"> {address.town}</span>
            )}
          </p>
          <p className="address-cell__comments footnote1-r">
            {address.comments}
          </p>
        </div>
      </div>
    </ElementCell>
  )
}

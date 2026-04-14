import { useTranslation } from 'react-i18next'

import { array, func } from 'prop-types'

import { AddressCell } from 'app/address/components/address-cell'
import { Address } from 'domain/address'
import { useId } from 'hooks/useId'

import './styles/AddressList.css'

export const AddressList = ({
  addresses,
  onPermanentAddress,
  onDeleteAddress,
}) => {
  const { t } = useTranslation()
  const id = useId()

  const permanentAddress = addresses.find((address) =>
    Address.isPermanent(address),
  )
  const otherAddresses = addresses.filter(
    (address) => !Address.isPermanent(address),
  )

  return (
    <div className="address-list" data-testid="address-list">
      {permanentAddress && (
        <section data-testid="permament-address">
          <AddressCell
            key={permanentAddress.id}
            address={permanentAddress}
            onPermanentAddress={() => onPermanentAddress(permanentAddress.id)}
            onDeleteAddress={() => onDeleteAddress(permanentAddress.id)}
          />
        </section>
      )}
      {otherAddresses.length > 0 && (
        <section
          data-testid="other-addresses"
          aria-labelledby={`${id}-other-addresses`}
        >
          <h2
            className="address-list__title subhead1-b"
            id={`${id}-other-addresses`}
          >
            {t('user_area.addresses.other_adresses.title')}
          </h2>
          <ul aria-labelledby={`${id}-other-addresses`}>
            {otherAddresses.map((address) => (
              <AddressCell
                key={address.id}
                address={address}
                onPermanentAddress={() => onPermanentAddress(address.id)}
                onDeleteAddress={() => onDeleteAddress(address.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

AddressList.propTypes = {
  addresses: array.isRequired,
  onDeleteAddress: func.isRequired,
  onPermanentAddress: func.isRequired,
}

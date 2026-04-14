import { useTranslation } from 'react-i18next'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import { AddressListContainer } from 'app/address/containers/address-list-container'

import './assets/AddressLayout.css'

const AddressLayout = () => {
  const { t } = useTranslation()
  return (
    <div className="address-list__layout">
      <FocusedElementWithInitialFocus>
        <h1 className="address-layout__header title1-b">
          {t('user_area.addresses.title')}
        </h1>
      </FocusedElementWithInitialFocus>
      <AddressListContainer />
    </div>
  )
}

export { AddressLayout }

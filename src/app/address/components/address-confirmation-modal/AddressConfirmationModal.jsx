import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AddressMap } from '../address-map'
import * as PropTypes from 'prop-types'

import { AddressMetrics } from 'app/address/metrics'
import { useFlowIdContext } from 'app/shared/flow-id'
import Button, { ButtonWithFeedback } from 'components/button'
import Modal from 'components/modal'

import './styles/AddressConfirmationModal.css'

export const AddressConfirmationModal = ({
  userFlow,
  defaultBounds,
  onConfirm,
  onClose,
  onPinChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState(0)
  const isFirstRender = useRef(true)
  const [selectedLocation, setSelectedLocation] = useState({
    postal_code: '',
    town: '',
    latitude: '',
    longitude: '',
  })
  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  const viewPort = useMemo(
    () => ({
      southwest: {
        lat: defaultBounds.southwest.latitude,
        lng: defaultBounds.southwest.longitude,
      },
      northeast: {
        lat: defaultBounds.northeast.latitude,
        lng: defaultBounds.northeast.longitude,
      },
    }),
    [defaultBounds],
  )

  const handleClose = () => {
    AddressMetrics.addressMapBackClick(flowId, selectedLocation)
    onClose()
  }

  const handleConfirm = () => {
    onConfirm({ address: selectedLocation, zoomLevel })
  }

  const handleLocationSelect = ({ postal_code, town, latitude, longitude }) => {
    if (isFirstRender.current) return

    onPinChange({
      postalCode: postal_code,
      town,
      latitude,
      longitude,
      zoomLevel,
    })
    setSelectedLocation({
      postal_code,
      town,
      latitude,
      longitude,
    })
  }

  return (
    <Modal
      ariaLabelModal={t('address_map.title')}
      className="address-confirmation-modal__container"
    >
      <h3 className="address-confirmation-modal__title title2-b">
        {t('address_map.title')}
      </h3>
      <div className="address-confirmation-modal__map-container">
        <AddressMap
          userFlow={userFlow}
          viewPort={viewPort}
          isFirstRender={isFirstRender}
          onLocationSelect={handleLocationSelect}
          onZoomSelect={setZoomLevel}
        />
      </div>
      <div className="address-confirmation-modal__buttons-container">
        <Button
          text={t('address_map.cancel')}
          type="secondary"
          className="address-confirmation-modal__button"
          onClick={handleClose}
        >
          {t('address_map.cancel')}
        </Button>
        <ButtonWithFeedback
          text={t('address_map.confirm')}
          className="address-confirmation-modal__button"
          disabled={isFirstRender.current}
          onClick={handleConfirm}
        >
          {t('address_map.confirm')}
        </ButtonWithFeedback>
      </div>
    </Modal>
  )
}

AddressConfirmationModal.propTypes = {
  userFlow: PropTypes.string.isRequired,
  defaultBounds: PropTypes.shape({
    northeast: {
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    },
    southwest: {
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    },
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onPinChange: PropTypes.func,
}

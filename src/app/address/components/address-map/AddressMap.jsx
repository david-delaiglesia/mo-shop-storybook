import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import pinDownImage from '../../../assets/pin-down.png'
import pinImage from '../../../assets/pin.png'
import pinDownHybridModeImage from '../../../assets/pinDownHybridModeImage.png'
import pinHybridModeImage from '../../../assets/pinHybridModeImage.png'
import { AddressConfirmationModalLabel } from '../address-confirmation-modal/AddressConfirmationModalLabel'
import { LocateMeButton } from '../locate-me-button'
import * as PropTypes from 'prop-types'

import { useAddressReverse } from 'app/address'
import { MAP } from 'app/address/constants'
import { AddressMetrics } from 'app/address/metrics'
import { useFlowIdContext } from 'app/shared/flow-id'
import { GoogleMaps } from 'services/google-maps/GoogleMaps'
import { CUSTOM_ERRORS, NetworkError } from 'services/http'

import '../../../../components/map/assets/Map.css'

const PERMISSION_DENIED = 1

const AddressMap = ({
  userFlow,
  viewPort,
  zoom = MAP.DEFAULT_ZOOM,
  isFirstRender,
  onLocationSelect,
  onZoomSelect,
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [isIdle, setIsIdle] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isHybridMode, setIsHybridMode] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const { t } = useTranslation()
  const { flowId } = useFlowIdContext()

  const { getAddressReverse } = useAddressReverse()

  useEffect(() => {
    initMap()
  }, [])

  const handlePinDrop = async () => {
    const centerMap = mapInstance.current.getCenter()

    const coordinates = {
      latitude: centerMap.lat(),
      longitude: centerMap.lng(),
    }

    const addressReverse = await getAddressReverse({
      ...coordinates,
      userFlow,
      flowId,
    })

    if (addressReverse) {
      const place = {
        ...addressReverse,
        ...coordinates,
        postal_code: addressReverse.postalCode,
        town: addressReverse.town,
        latitude: addressReverse.latitude,
        longitude: addressReverse.longitude,
      }

      setSelectedLocation(place)
      onLocationSelect && onLocationSelect(place)
    }
    if (!addressReverse) {
      setSelectedLocation(null)
      onLocationSelect && onLocationSelect(coordinates)
    }

    setIsMoving(false)
  }

  const initMap = async () => {
    const bounds = GoogleMaps.getMapBounds(
      viewPort.southwest,
      viewPort.northeast,
    )
    mapInstance.current = GoogleMaps.getMap(mapRef.current, {
      zoom: zoom,
      /**
       * @see https://developers.google.com/maps/premium/faq#no_pois
       */
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'on' }],
        },
      ],
      draggable: true,
      draggableCursor: 'default',
      clickableIcons: false,
      zoomControl: true,
      controlSize: 28,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: true,
      tilt: 0,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        mapTypeIds: [
          window.google.maps.MapTypeId.ROADMAP,
          window.google.maps.MapTypeId.HYBRID,
        ],
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      },
      restriction: {
        latLngBounds: {
          north: 85,
          south: -85,
          west: -150,
          east: 150,
        },
        strictBounds: true,
      },
    })

    mapInstance.current.fitBounds(bounds)

    mapInstance.current.addListener('center_changed', () => {
      if (!isFirstRender.current) {
        setIsMoving(true)
        setIsIdle(false)
      }
      if (mapInstance.current && isFirstRender.current) {
        onLocationSelect({
          latitude: mapInstance.current.getCenter().lat(),
          longitude: mapInstance.current.getCenter().lng(),
        })
      }
    })

    mapInstance.current.addListener('maptypeid_changed', () => {
      const mapType = mapInstance.current.getMapTypeId()
      if (mapType === window.google.maps.MapTypeId.HYBRID) {
        AddressMetrics.addressMapChangeViewType(
          flowId,
          AddressMetrics.MAP_VIEW_TYPE.SATELLITE,
        )
        setIsHybridMode(true)
      } else {
        setIsHybridMode(false)
        AddressMetrics.addressMapChangeViewType(
          flowId,
          AddressMetrics.MAP_VIEW_TYPE.DEFAULT,
        )
      }
    })

    mapInstance.current.addListener('zoom_changed', () => {
      onZoomSelect(mapInstance.current.getZoom())
    })
  }

  useEffect(() => {
    mapInstance.current?.addListener('idle', () => {
      mapInstance.current.mapTypes.hybrid.name = t('address_map.satellite')

      if (isFirstRender.current) {
        isFirstRender.current = false
        return
      }
      setIsIdle(true)
      handlePinDrop()
    })

    return () => {
      if (mapInstance.current) {
        google.maps.event.clearListeners(mapInstance.current, 'idle')
      }
    }
  }, [handlePinDrop])

  const locateMe = () => {
    setIsMoving(true)
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        mapInstance.current.setCenter(userLocation)
        AddressMetrics.addressMapLocateMeClick(
          flowId,
          position.coords.latitude,
          position.coords.longitude,
        )
      },
      (error) => {
        setIsMoving(false)

        if (error?.code === PERMISSION_DENIED) {
          NetworkError.publish({
            status: CUSTOM_ERRORS.LOCATION_PERMISSION_DENIED,
          })
          return
        }

        NetworkError.publish({
          status: CUSTOM_ERRORS.LOCATION_UNHANDLED_ERROR,
        })
      },
    )
  }

  return (
    <>
      <AddressConfirmationModalLabel
        isIdle={isIdle}
        isMoving={isMoving}
        isFirstRender={isFirstRender.current}
        selectedLocation={selectedLocation}
      />
      <LocateMeButton onClick={locateMe} t={t} />
      {isIdle && (
        <img
          src={isHybridMode ? pinDownHybridModeImage : pinDownImage}
          alt="pin down"
          width="40"
          height="52"
          className="address-confirmation-modal__pin-down"
          aria-label="Pin down"
        />
      )}
      {!isIdle && (
        <img
          src={isHybridMode ? pinHybridModeImage : pinImage}
          alt="pin"
          width="40"
          height="72"
          className="address-confirmation-modal__pin"
          aria-label="Pin"
        />
      )}
      <div className="map" ref={mapRef}></div>
    </>
  )
}

AddressMap.propTypes = {
  userFlow: PropTypes.string.isRequired,
  zoom: PropTypes.number,
  viewPort: PropTypes.shape({
    southwest: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    northeast: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  }),
  isFirstRender: PropTypes.shape({
    current: PropTypes.bool,
  }),
  onLocationSelect: PropTypes.func,
  onZoomSelect: PropTypes.func,
}

export { AddressMap }

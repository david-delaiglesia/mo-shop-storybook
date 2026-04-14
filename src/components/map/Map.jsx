import { Component } from 'react'

import { compareSimpleObjects } from '../../utils/objects'
import img from './assets/marker.png'
import PropTypes from 'prop-types'

import { MAP } from 'app/address/constants'

import './assets/Map.css'

class Map extends Component {
  constructor(props) {
    super(props)

    this.map = undefined
    this.marker = undefined
    this.zoom = this.props.zoom || MAP.DEFAULT_ZOOM
  }

  componentDidMount() {
    this.initMap()
  }

  componentDidUpdate(prevProps) {
    const isEqual = compareSimpleObjects(prevProps, this.props)
    if (isEqual) {
      return
    }
    this.updateMap(this.props)
  }

  initMap() {
    const { draggable } = this.props
    const pos = new window.google.maps.LatLng(
      this.props.latitude,
      this.props.longitude,
    )
    const mapOptions = {
      zoom: this.zoom,
      center: pos,
      draggable,
      fullscreenControl: false,
      draggableCursor: 'default',
      clickableIcons: false,
    }

    this.map = new window.google.maps.Map(this._mapRef, mapOptions)
    if (this.props.marker) {
      this.addMarker(pos)
    }
  }

  updateMap(data) {
    const pos = new window.google.maps.LatLng(data.latitude, data.longitude)
    this.map.panTo(pos)
    this.map.setZoom(data.zoom)
    data.marker ? this.addMarker(pos) : this.marker && this.removeMarker()
  }

  addMarker(pos) {
    if (this.marker) {
      return this.moveMarker(pos)
    }

    const icon = {
      url: img,
      scaledSize: new window.google.maps.Size(65, 65),
    }

    this.marker = new window.google.maps.Marker({
      position: pos,
      draggable: false,
      animation: window.google.maps.Animation.DROP,
      icon: icon,
      map: this.map,
    })
  }

  moveMarker(pos) {
    this.marker.setPosition(pos)
  }

  removeMarker() {
    this.marker.setPosition(null)
  }

  render() {
    const { ariaLabel } = this.props
    return (
      <div
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        className="map"
        ref={(ref) => (this._mapRef = ref)}
      ></div>
    )
  }
}

Map.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  zoom: PropTypes.number,
  marker: PropTypes.bool.isRequired,
  draggable: PropTypes.bool,
  ariaLabel: PropTypes.string,
}

Map.defaultProps = {
  draggable: false,
}

export default Map

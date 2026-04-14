/* eslint-disable */
import { Component, createRef } from 'react'

import classNames from 'classnames'
import { array, func, number, string } from 'prop-types'

import { ProductGalleryThumbnails } from 'app/catalog/components/product-gallery-thumbnails'
import { sendZoomImageClickMetrics } from 'app/catalog/metrics'
import { CustomImg } from 'components/custom-img'
import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import placeholder from 'system-ui/assets/img/placeholder.jpg'
import unavailable from 'system-ui/assets/img/unavailable.jpg'
import { imageLoader } from 'utils/image-loader'

import './styles/ImageZoomer.css'

class ImageZoomer extends Component {
  SCALE = 4
  DEFAULT_CURSOR = 'image-zoomer__cursor'
  ZOOM_IN_CURSOR = 'image-zoomer__cursor--magnifizer'
  ZOOM_OUT_CURSOR = 'image-zoomer__cursor--decreaser'

  state = {
    zoomedImageStyle: {},
    cursorClass: this.DEFAULT_CURSOR,
  }

  offset = {
    top: 0,
    left: 0,
  }

  cursor = {
    x: 0,
    y: 0,
  }

  containerRef = createRef()
  imageRef = createRef()
  containerBoundingRect = {}
  imageBoundingRect = {}
  mouseMoveRafTimer = 0
  isZoomEnabled = false
  isInside = false

  componentDidMount = () => {
    document.addEventListener('mousemove', this.onMouseMoveAnimationFrame)
    window.addEventListener('scroll', this.setBoundingRect)
    window.addEventListener('resize', this.onResize)

    this.setBoundingRect()
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousemove', this.onMouseMoveAnimationFrame)
    window.removeEventListener('scroll', this.setBoundingRect)
    window.removeEventListener('resize', this.onResize)
  }

  onResize = (e) => {
    const oldresize = window.onresize

    const event = window.event || e
    if (typeof oldresize === 'function' && !oldresize.call(window, event)) {
      return false
    }

    this.setBoundingRect()
  }

  setBoundingRect = () => {
    if (this.containerRef.current) {
      this.containerBoundingRect =
        this.containerRef.current.getBoundingClientRect()
    }

    if (this.imageRef.current) {
      this.imageBoundingRect = this.imageRef.current.getBoundingClientRect()
    }
  }

  loadImage = (src) => {
    this.setState((state) => ({
      zoomedImageStyle: {
        ...state.zoomedImageStyle,
        backgroundImage: `url(${src})`,
      },
    }))
  }

  setInitialStyleValues = () => {
    const backgroundSize = this.SCALE * this.imageBoundingRect.width
    const width = this.containerBoundingRect.width
    const height = this.containerBoundingRect.height

    this.setState({
      zoomedImageStyle: {
        width,
        height,
        backgroundSize,
        backgroundImage: `url(${this.props.selectedImage})`,
      },
    })

    const onLoad = this.loadImage.bind(this, this.props.selectedZoom)
    const onError = this.loadImage.bind(this, unavailable)
    imageLoader(this.props.selectedZoom, onLoad, onError)
  }

  onEnableZoomClick = (event) => {
    const { id, displayName, selectedImage, position } = this.props
    this.isZoomEnabled = true
    this.setBoundingRect()

    sendZoomImageClickMetrics({ id, displayName, selectedImage, position })
    this.setInitialStyleValues()
    this.setCursorPosition(event)
    this.setCursorStyle()
    this.applyZoomAnimation()
  }

  onDisableZoomClick = () => {
    this.isZoomEnabled = false
    this.setBoundingRect()

    this.resetZoom()
    this.setCursorStyle()
  }

  onMouseMoveAnimationFrame = (event) => {
    cancelAnimationFrame(this.mouseMoveRafTimer)
    this.mouseMoveRafTimer = requestAnimationFrame(
      this.onMouseMoveHandle.bind(this, event),
    )
  }

  onMouseMoveHandle = (event) => {
    const onMouseLeave = !this.isNowInside(event)
    const onMouseEnter = !onMouseLeave && !this.isInside

    if (onMouseLeave) {
      this.resetZoom()
      return
    }

    if (onMouseEnter) {
      this.isInside = true
      this.setCursorStyle()
    }

    this.setOffset()
    this.setCursorPosition(event)
    if (this.isZoomEnabled) {
      this.applyZoomAnimation()
    }
  }

  isNowInside = ({ clientX, clientY }) => {
    const boundingRect = this.isZoomEnabled
      ? this.containerBoundingRect
      : this.imageBoundingRect
    const isInsideHorizontalAxis =
      clientX >= boundingRect.left && clientX <= boundingRect.right
    const isInsideVerticalAxis =
      clientY >= boundingRect.top && clientY <= boundingRect.bottom

    return isInsideHorizontalAxis && isInsideVerticalAxis
  }

  setZoomedImageStyle = (backgroundPosition) => {
    this.setState((state) => ({
      zoomedImageStyle: {
        ...state.zoomedImageStyle,
        backgroundPosition,
        display: 'block',
      },
    }))
  }

  setCursorPosition = ({ clientX, clientY }) => {
    const { left, top } = this.offset
    this.cursor.x = clientX - left
    this.cursor.y = clientY - top
  }

  setCursorStyle = () => {
    let cursorClass = this.ZOOM_IN_CURSOR
    if (this.isZoomEnabled) {
      cursorClass = this.ZOOM_OUT_CURSOR
    }

    this.setState({ cursorClass })
  }

  applyZoomAnimation = () => {
    const { x, y } = this.cursor
    const backgroundTop = this.SCALE * x - x
    const backgroundRight = this.SCALE * y - y
    const backgroundPosition = `${-backgroundTop}px ${-backgroundRight}px`

    this.setZoomedImageStyle(backgroundPosition)
  }

  resetZoom = () => {
    this.isZoomEnabled = false
    this.isInside = false

    this.setState({
      zoomedImageStyle: { display: 'none' },
      cursorClass: this.DEFAULT_CURSOR,
    })
  }

  setOffset = () => {
    const boundingRect = this.isZoomEnabled
      ? this.containerBoundingRect
      : this.imageBoundingRect
    if (!boundingRect) {
      this.offset = { left: 0, top: 0 }
      return
    }

    const { left, top } = boundingRect
    this.offset = { left, top }
  }

  selectImage = (index) => {
    this.resetZoom()
    this.props.selectImage(index)
  }

  renderImageOverLay = () => {
    const imageCursorClass = classNames(
      'image-overlay__image',
      { [this.ZOOM_OUT_CURSOR]: this.isZoomEnabled },
      { [this.ZOOM_IN_CURSOR]: !this.isZoomEnabled },
    )
    const containerCursorClass = classNames(
      'image-zoomer__image-overlay',
      { [this.ZOOM_OUT_CURSOR]: this.isZoomEnabled },
      { [this.DEFAULT_CURSOR]: !this.isZoomEnabled },
    )

    if (this.isZoomEnabled) {
      return (
        <div
          className={containerCursorClass}
          onClick={this.onDisableZoomClick}
          ref={this.containerRef}
          data-testid="image-zoomer-overlay-container"
        />
      )
    }

    return (
      <div className={`${containerCursorClass}`} ref={this.containerRef}>
        <div
          className={imageCursorClass}
          ref={this.imageRef}
          onClick={this.onEnableZoomClick}
          data-testid="image-zoomer-overlay-image"
        />
      </div>
    )
  }

  render() {
    const {
      selectedImage,
      selectedThumbnail,
      photos,
      position,
      alt,
      displayName,
    } = this.props
    const { zoomedImageStyle } = this.state

    return (
      <div className="image-zoomer">
        {this.renderImageOverLay()}

        <div
          className="image-zoomer__source"
          role="button"
          data-testid="image-zoomer-container"
        >
          <CustomImg
            placeHolder={placeholder}
            thumbnail={selectedThumbnail}
            error={unavailable}
            src={selectedImage}
            alt={alt}
          />
        </div>

        {this.isZoomEnabled && (
          <div style={zoomedImageStyle} className="image-zoomer--big" />
        )}

        <ProductGalleryThumbnails
          photos={photos}
          position={position}
          selectImage={this.selectImage}
          productName={displayName}
        />
      </div>
    )
  }
}

ImageZoomer.propTypes = {
  selectedImage: string,
  selectedThumbnail: string,
  selectedZoom: string,
  alt: string,
  photos: array,
  position: number.isRequired,
  selectImage: func.isRequired,
  displayName: string,
}

export { ImageZoomer }

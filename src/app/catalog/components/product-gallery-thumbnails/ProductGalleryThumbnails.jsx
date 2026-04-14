import { Component } from 'react'

import { Thumbnail } from '../thumbnail'
import { array, func, number, string } from 'prop-types'

import Arrow from 'system-ui/arrow'
import { TAB_INDEX } from 'utils/constants'

import './styles/ProductGalleryThumbnails.css'

const getShowedThumbnails = (availableWidth) => Math.round(availableWidth / 100)

const THUMBNAIL_HEIGHT = 88
const HEIGHT = 500
const MIN_WIDTH = 991
const MAX_WIDTH = 1200

const isActiveThumbnail = (index, position) => {
  return index === position
}

const getOffset = (thumbnailIndex) => {
  return thumbnailIndex * THUMBNAIL_HEIGHT * -1
}

const getVerticalPosition = (thumbnailIndex, availableWidth, photosLength) => {
  const maxThumbnailsVisible = getShowedThumbnails(availableWidth)
  const thumbnailPosition =
    maxThumbnailsVisible < photosLength ? thumbnailIndex : 0
  return { transform: `translateY(${getOffset(thumbnailPosition)}px)` }
}

const getGalleryThumbnailStyle = (availableHeight, photosLength) => {
  const maxThumbnailsVisible = getShowedThumbnails(availableHeight)
  if (photosLength <= maxThumbnailsVisible) {
    return {
      padding: 0,
    }
  }
  return {
    height: `${maxThumbnailsVisible * THUMBNAIL_HEIGHT}px`,
    margin: 'auto 0',
    padding: 0,
  }
}

const getGalleryThumbnailContentStyle = (availableWidth, photosLength) => {
  const maxThumbnailsVisible = getShowedThumbnails(availableWidth)
  if (photosLength <= maxThumbnailsVisible) return {}

  return {
    top: '30px',
    padding: '0px 8px',
  }
}

const bottomArrowDisabled = (thumbnailIndex, photos, showedThumbnail) =>
  thumbnailIndex >= photos.length - showedThumbnail

const topArrowDisabled = (thumbnailIndex) => thumbnailIndex < 1

class ProductGalleryThumbnails extends Component {
  state = {
    thumbnailIndex: 0,
    imageHeight: HEIGHT,
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
    this.handleHeight()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
  onResize = (e) => {
    const oldresize = window.onresize

    const event = window.event || e
    if (typeof oldresize === 'function' && !oldresize.call(window, event)) {
      return false
    }

    this.handleHeight()
  }

  handleHeight = () => {
    const windowWidth = window.innerWidth
    if (windowWidth < MAX_WIDTH && windowWidth > MIN_WIDTH) {
      this.setState({ imageHeight: 413 })
      return
    }
    this.setState({ imageHeight: HEIGHT })
  }
  thumbnailsBackward = () => {
    this.setState((state) => ({
      thumbnailIndex: state.thumbnailIndex - 1,
    }))
  }

  thumbnailsForward = () => {
    this.setState((state) => ({
      thumbnailIndex: state.thumbnailIndex + 1,
    }))
  }

  renderTopArrow = (photos, thumbnailIndex, availableWidth) => {
    const showedThumbnail = getShowedThumbnails(availableWidth)
    if (photos.length <= showedThumbnail) return null
    return (
      <Arrow
        direction="top"
        click={this.thumbnailsBackward}
        disabled={topArrowDisabled(thumbnailIndex)}
      />
    )
  }

  renderBottomArrow = (photos, thumbnailIndex, availableWidth) => {
    const showedThumbnail = getShowedThumbnails(availableWidth)
    if (photos.length <= showedThumbnail) return null
    return (
      <Arrow
        click={this.thumbnailsForward}
        direction="bottom"
        disabled={bottomArrowDisabled(thumbnailIndex, photos, showedThumbnail)}
      />
    )
  }

  render() {
    const { photos, position, selectImage, productName } = this.props
    const { thumbnailIndex, imageHeight } = this.state

    return (
      <div>
        <div
          className="product-gallery-thumbnails"
          style={getGalleryThumbnailStyle(imageHeight, photos.length)}
        >
          {this.renderTopArrow(photos, thumbnailIndex, imageHeight)}
          <div
            className="product-gallery-thumbnails__content"
            style={getGalleryThumbnailContentStyle(imageHeight, photos.length)}
          >
            {photos.map((photo, index) => (
              <div className="thumbnail__container" key={index}>
                <Thumbnail
                  index={index}
                  image={photo.thumbnail}
                  tabIndex={TAB_INDEX.DISABLED}
                  active={isActiveThumbnail(index, position)}
                  style={getVerticalPosition(
                    thumbnailIndex,
                    imageHeight,
                    photos.length,
                  )}
                  selectImage={selectImage}
                  productName={productName}
                />
              </div>
            ))}
          </div>
          {this.renderBottomArrow(photos, thumbnailIndex, imageHeight)}
        </div>
      </div>
    )
  }
}

ProductGalleryThumbnails.propTypes = {
  selectImage: func.isRequired,
  position: number.isRequired,
  productName: string.isRequired,
  photos: array,
}

ProductGalleryThumbnails.defaultProps = {
  photos: [],
}

export { ProductGalleryThumbnails }

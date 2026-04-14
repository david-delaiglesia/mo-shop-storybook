import { Component } from 'react'

import { array, string } from 'prop-types'

import { ImageZoomer } from 'components/image-zoomer'

import './assets/ProductGallery.css'

const getImages = (photos, thumbnail, position) => {
  if (!photos) {
    return {
      regular: '',
      thumbnail: thumbnail,
      zoom: '',
    }
  }

  return { ...photos[position] }
}

/**
 * TODO: Can we get rid of Component (state) when FF (PRODUCT_VOYEUR) is removed?
 * Right now the state is just to keep the position used by the ImageZoomerMetrics
 * When FF is removed, Thumbnails will be inside Zoomer so we could provide a method
 * to be called from the Metrics to the child... ¿?
 */
class ProductGallery extends Component {
  state = {
    position: 0,
  }

  selectImage = (index) => {
    this.setState({ position: index })
  }

  render() {
    const {
      id,
      display_name,
      photos,
      thumbnail: defaultThumbnail,
      alt,
    } = this.props
    const { position } = this.state
    const { regular, thumbnail, zoom } = getImages(
      photos,
      defaultThumbnail,
      position,
    )

    return (
      <div className="product-gallery">
        <ImageZoomer
          id={id}
          alt={alt}
          displayName={display_name}
          selectedZoom={zoom}
          selectedImage={regular}
          selectedThumbnail={thumbnail}
          photos={photos}
          position={position}
          selectImage={this.selectImage}
        />
      </div>
    )
  }
}

ProductGallery.propTypes = {
  id: string.isRequired,
  thumbnail: string.isRequired,
  display_name: string.isRequired,
  photos: array,
  alt: string,
}

export { ProductGallery }

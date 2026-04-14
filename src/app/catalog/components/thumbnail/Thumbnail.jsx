import classNames from 'classnames'
import { bool, func, number, object, string } from 'prop-types'

import { withTranslate } from 'app/i18n/containers/i18n-provider'

const THUMBNAIL_SELECTED_CLASS = 'product-gallery__thumbnail--selected'

const Thumbnail = ({
  style,
  image,
  tabIndex,
  active,
  index,
  selectImage,
  productName,
  t,
}) => {
  const thumbnailSelectImage = () => {
    selectImage(index)
  }

  const onKeyPress = (event) => {
    if (event.key !== 'Enter') {
      return
    }

    thumbnailSelectImage()
  }

  const thumbnailClass = classNames('product-gallery__thumbnail', {
    [THUMBNAIL_SELECTED_CLASS]: active,
  })

  return (
    <button
      className={thumbnailClass}
      style={style}
      tabIndex={tabIndex}
      onKeyPress={onKeyPress}
      onClick={thumbnailSelectImage}
      aria-label={`${t(
        'accessibility_product_detail_image_thumbnail',
      )} ${productName}`}
    >
      <img alt="" src={image} />
    </button>
  )
}

Thumbnail.propTypes = {
  index: number.isRequired,
  image: string.isRequired,
  style: object.isRequired,
  tabIndex: number.isRequired,
  active: bool.isRequired,
  selectImage: func.isRequired,
  productName: string.isRequired,
  t: func.isRequired,
}

const ThumbnailTranslated = withTranslate(Thumbnail)

export { ThumbnailTranslated as Thumbnail }

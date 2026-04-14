import { knownFeatureFlags, useFlag } from 'services/feature-flags'
import unavailableImg from 'system-ui/assets/img/unavailable.jpg'

interface CartProductCellImageProps {
  thumbnail: string
}
export const CartProductCellImage = ({
  thumbnail,
}: CartProductCellImageProps) => {
  const isCartProductThumbnailFallbackEnabled = useFlag(
    knownFeatureFlags.WEB_CART_PRODUCT_THUMBNAIL_FALLBACK,
  )

  if (isCartProductThumbnailFallbackEnabled) {
    return (
      <img
        alt=""
        src={thumbnail}
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = unavailableImg
        }}
      />
    )
  }

  return <img alt="" src={thumbnail} />
}

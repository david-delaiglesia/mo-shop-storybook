import classNames from 'classnames'

import { getAriaLabelForProductCell } from 'app/accessibility'
import { ProductFormat } from 'app/catalog/components/product-format'
import { ProductPrice } from 'app/catalog/components/product-price'
import {
  ProductQuantityButton,
  ProductQuantityButtonWithExtraWater,
} from 'app/catalog/components/product-quantity-button'
import { CustomImg } from 'components/custom-img'
import { Cart } from 'domain/cart'
import { Product } from 'domain/product'
import placeholder from 'system-ui/assets/img/placeholder.jpg'
import unavailable from 'system-ui/assets/img/unavailable.jpg'
import { GRID_THEME } from 'utils/products'

import './VideoSectionProductCard.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WaterButton = ProductQuantityButtonWithExtraWater as any
interface VideoSectionProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderLine: any
  addProductToCart: () => void
  decreaseProductFromCart: () => void
  openProduct: () => void
}

export const VideoSectionProductCard = ({
  product,
  orderLine,
  addProductToCart,
  decreaseProductFromCart,
  openProduct,
}: VideoSectionProductCardProps) => {
  const quantity = Cart.getProductQuantity(orderLine)
  const priceInstructions =
    orderLine?.priceInstructions || product.price_instructions

  return (
    <article
      className={classNames('video-section-product-card', {
        'video-section-product-card--in-cart': quantity,
      })}
      data-testid="video-section-product-card"
    >
      <button
        className="video-section-product-card__open"
        aria-label={getAriaLabelForProductCell(product)}
        onClick={openProduct}
      />

      <div className="video-section-product-card__image">
        <CustomImg
          placeHolder={placeholder}
          error={unavailable}
          src={product.thumbnail}
          alt={product.display_name}
        />
      </div>

      <div className="video-section-product-card__info">
        <div>
          <h4 className="video-section-product-card__name subhead1-r">
            {product.display_name}
          </h4>
          <ProductFormat product={product} />
        </div>

        <div>
          <ProductPrice priceInstructions={priceInstructions} />
          <div className="video-section-product-card__actions">
            {Product.isWater(product) ? (
              <WaterButton
                productId={product.id}
                priceInstructions={product.price_instructions}
                recommendedQuantity={product.recommendedQuantity}
                quantity={quantity}
                theme={GRID_THEME}
                size="small"
                addProductToCart={addProductToCart}
                decreaseProductFromCart={decreaseProductFromCart}
              />
            ) : (
              <ProductQuantityButton
                productId={product.id}
                priceInstructions={product.price_instructions}
                recommendedQuantity={product.recommendedQuantity}
                quantity={quantity}
                theme={GRID_THEME}
                size="small"
                addProductToCart={addProductToCart}
                decreaseProductFromCart={decreaseProductFromCart}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

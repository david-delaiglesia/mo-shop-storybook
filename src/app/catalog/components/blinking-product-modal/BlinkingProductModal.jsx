import { array, func, string } from 'prop-types'

import { BlinkingProduct } from 'app/catalog/components/blinking-product'
import { ScrollableModal } from 'system-ui/scrollableModal'

import './BlinkingProductModal.css'

const BlinkingProductModal = ({
  blinkingProductsList,
  title,
  primaryActionText,
  secondaryActionText,
  primaryAction,
  secondaryAction,
  selectedDay,
}) => {
  if (!blinkingProductsList.length) return null

  return (
    <ScrollableModal
      title={title}
      primaryActionText={primaryActionText}
      primaryAction={primaryAction}
      secondaryActionText={secondaryActionText}
      secondaryAction={secondaryAction}
      hideModal={() => null}
    >
      <div className="blinking_products_modal__list">
        {blinkingProductsList.map(({ product }) => {
          return (
            <BlinkingProduct
              key={product.id}
              product={product}
              selectedDay={selectedDay}
            />
          )
        })}
      </div>
    </ScrollableModal>
  )
}

BlinkingProductModal.propTypes = {
  blinkingProductsList: array.isRequired,
  primaryAction: func.isRequired,
  secondaryAction: func.isRequired,
  title: string,
  primaryActionText: string,
  secondaryActionText: string,
  selectedDay: string,
}

export { BlinkingProductModal }

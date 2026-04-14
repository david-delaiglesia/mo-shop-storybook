import { string } from 'prop-types'

import { getLocalePrize } from 'utils/maths'

import './FreeDelivery.css'

const FreeDelivery = ({ slotBonus, delivery, textClassName }) => {
  if (!slotBonus) {
    return <p className={textClassName}>{getLocalePrize(delivery)} €</p>
  }

  return (
    <p className={`${textClassName} free-delivery__subtotals-bonus`}>
      {getLocalePrize(slotBonus)} €
    </p>
  )
}

FreeDelivery.propTypes = {
  slotBonus: string,
  delivery: string.isRequired,
  textClassName: string,
}

export { FreeDelivery }

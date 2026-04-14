import { elementType, node, oneOfType, string } from 'prop-types'

import { Card } from '@mercadona/mo.library.shop-ui/card'

import './OrderDetailCard.css'

function OrderDetailCard({ children, ...props }) {
  return (
    <Card {...props} as="section">
      {children}
    </Card>
  )
}

OrderDetailCard.propTypes = {
  'aria-label': string.isRequired,
  children: node.isRequired,
}

OrderDetailCard.Header = function Header({ children }) {
  return <div className="order-detail-card__header">{children}</div>
}

OrderDetailCard.Header.propTypes = {
  children: node.isRequired,
}

OrderDetailCard.Title = function Title({ as: TagName = 'h2', children }) {
  return (
    <TagName className="order-detail-card__title title2-b">{children}</TagName>
  )
}

OrderDetailCard.Title.propTypes = {
  as: oneOfType([elementType, string]),
  children: string.isRequired,
}

OrderDetailCard.Content = function Content({ children }) {
  return <div className="order-detail-card__content">{children}</div>
}

OrderDetailCard.Content.propTypes = {
  children: node.isRequired,
}

OrderDetailCard.STATUSES = Card.STATUSES

export { OrderDetailCard }

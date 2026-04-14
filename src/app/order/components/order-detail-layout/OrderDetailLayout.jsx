import { node } from 'prop-types'

import './styles/OrderDetailLayout.css'

const OrderDetailLayout = ({ children }) => (
  <div className="order-detail-layout">{children}</div>
)

OrderDetailLayout.propTypes = {
  children: node.isRequired,
}

export default OrderDetailLayout

import { useTranslation } from 'react-i18next'

import OrderCellContainer from '../../containers/order-cell-container'
import { array, arrayOf, bool, func, shape, string } from 'prop-types'

import { FocusedElementWithInitialFocus } from 'app/accessibility'
import Button from 'components/button'
import WaitingResponse from 'components/waiting-response'

import './OrdersList.css'

export const OrdersList = ({
  ordersByMonth,
  isViewMoreButtonVisible,
  onViewMoreClick,
  isLoading,
}) => {
  const { t } = useTranslation()

  return (
    <div className="orders-list">
      <div className="orders-list__header">
        <FocusedElementWithInitialFocus>
          <h1 className="orders-list__title title1-b">
            {t('user_area.orders.title')}
          </h1>
        </FocusedElementWithInitialFocus>
      </div>

      {isLoading ? (
        <div className="orders-list__loader">
          <WaitingResponse />
        </div>
      ) : (
        <>
          {ordersByMonth.map(({ month, orders }, i) => (
            <div key={i} className="orders-list__month">
              <h2 className="orders-list__month-name subhead1-b">{month}</h2>
              {orders.map((order) => (
                <OrderCellContainer key={order.id} order={order} />
              ))}
            </div>
          ))}
          {isViewMoreButtonVisible && (
            <Button
              datatest="orders-see-more"
              text={t('user_area.orders.see_more')}
              onClick={onViewMoreClick}
              type="secondary"
            />
          )}
        </>
      )}
    </div>
  )
}

OrdersList.propTypes = {
  isViewMoreButtonVisible: bool,
  onViewMoreClick: func,
  ordersByMonth: arrayOf(
    shape({
      month: string.isRequired,
      orders: array.isRequired,
    }).isRequired,
  ).isRequired,
  isLoading: bool,
}

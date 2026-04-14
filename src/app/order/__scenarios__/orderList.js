import {
  cancelledByEditOrder,
  cancelledByUserOrder,
  deliveredOrder,
  deliveringOrder,
  disruptedByEditOrder,
  disruptedByUserOrder,
  disruptedPaymentOrder,
  order,
  preparedOrder,
  preparingOrder,
} from 'app/order/__scenarios__/orderDetail'

const emptyOrderList = {
  results: [],
}

const ordersList = {
  results: [
    order,
    preparingOrder,
    preparedOrder,
    deliveringOrder,
    deliveredOrder,
    disruptedPaymentOrder,
  ],
}

const ordersListWithCancelledByUser = {
  results: [cancelledByUserOrder],
}

const ordersListWithCancelledByEdit = {
  results: [cancelledByEditOrder],
}

const ordersListWithDisruptedByUser = {
  results: [disruptedByUserOrder],
}

const ordersListWithDisruptedByEdit = {
  results: [disruptedByEditOrder],
}

export {
  emptyOrderList,
  ordersList,
  ordersListWithCancelledByUser,
  ordersListWithCancelledByEdit,
  ordersListWithDisruptedByUser,
  ordersListWithDisruptedByEdit,
}

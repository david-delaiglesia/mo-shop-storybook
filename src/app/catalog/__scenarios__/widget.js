const confirmedWidget = {
  id: 1001,
  start_date: '2020-06-20T07:00:00Z',
  end_date: '2020-06-20T08:00:00Z',
  status_ui: 'confirmed',
  payment_status: 1,
  changes_until: '2220-02-25T21:00:00Z',
  timezone: 'Europe/Madrid',
}

const preparingWidget = {
  id: 1002,
  start_date: '2020-08-26T14:00:00Z',
  end_date: '2020-08-26T15:00:00Z',
  status_ui: 'preparing',
  payment_status: 0,
  timezone: 'Europe/Madrid',
}

const preparedWidget = {
  id: 1003,
  start_date: '2020-06-20T07:00:00Z',
  end_date: '2020-06-20T08:00:00Z',
  status_ui: 'prepared',
  payment_status: 1,
  timezone: 'Europe/Madrid',
}

const deliveringWidget = {
  id: 1004,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'delivering',
  payment_status: 1,
  timezone: 'Europe/Madrid',
}

const nextToDeliveryWidget = {
  id: 1004,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'next-to-delivery',
  payment_status: 1,
  timezone: 'Europe/Madrid',
}

const deliveredWidget = {
  id: 1005,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'delivered',
  payment_status: 1,
  service_rating_token: '12345',
  timezone: 'Europe/Madrid',
}

const deliveredAndRatedWidget = {
  id: 1005,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'delivered',
  payment_status: 1,
  service_rating_token: null,
  timezone: 'Europe/Madrid',
}

const paymentIssueWidget = {
  id: 1006,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'delivering',
  payment_status: 2,
  timezone: 'Europe/Madrid',
}

const userUnreachableWidget = {
  id: 1007,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'user-unreachable',
  payment_status: 1,
  timezone: 'Europe/Madrid',
}

const delayedWidget = {
  id: 1008,
  start_date: '2020-08-25T19:00:00Z',
  end_date: '2020-08-25T20:00:00Z',
  status_ui: 'delayed',
  payment_status: 0,
  timezone: 'Europe/Madrid',
}

const preparedNotPaidWidget = {
  id: 1009,
  start_date: '2020-06-20T07:00:00Z',
  end_date: '2020-06-20T08:00:00Z',
  status_ui: 'prepared',
  payment_status: 0,
  timezone: 'Europe/Madrid',
}

export {
  confirmedWidget,
  preparingWidget,
  preparedWidget,
  deliveringWidget,
  nextToDeliveryWidget,
  deliveredWidget,
  deliveredAndRatedWidget,
  paymentIssueWidget,
  userUnreachableWidget,
  delayedWidget,
  preparedNotPaidWidget,
}

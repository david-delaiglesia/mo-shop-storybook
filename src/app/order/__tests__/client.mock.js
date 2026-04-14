const order = {
  id: 123,
  slot: {
    start: '2022-09-21T18:00:00Z',
    end: '2022-09-21T18:00:00Z',
  },
  summary: { total: '12.12' },
}

function getByIdSuccess() {
  return new Promise((resolve) => resolve(order))
}

function getByIdError() {
  return new Promise((resolve, reject) => reject({}))
}

export const OrderClientMock = {
  getByIdSuccess,
  getByIdError,
}

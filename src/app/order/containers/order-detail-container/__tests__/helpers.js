import { screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const openOrderProducts = async () => {
  const orderProducts = await screen.findByTestId('open-order-lines')

  await userEvent.click(orderProducts)
}

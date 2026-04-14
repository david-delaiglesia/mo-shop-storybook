import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import ModalInfo from '..'
import configureMockStore from 'redux-mock-store'
import { vi } from 'vitest'

import { cookies } from 'app/cookie/__scenarios__/cookies.js'
import { Cookie } from 'services/cookie'

const mockStore = configureMockStore()
const store = mockStore()

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

describe('<ModalInfo />', () => {
  const props = {
    title: 'myTitle',
    description: 'myDescription',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
    onCancel: vi.fn(),
    t: vi.fn(),
  }

  it('should render cancel button', async () => {
    render(
      <Provider store={store}>
        <ModalInfo
          {...props}
          cancelButtonText="Cancelar"
          onCancel={() => null}
        />
      </Provider>,
    )

    const cancelButton = await screen.findByRole('button', { name: 'Cancelar' })
    expect(cancelButton.closest('div')).toHaveClass('modal-info__cancel-button')
  })

  it('should have different button type if receive confirmButtonFeedBack prop', async () => {
    render(
      <Provider store={store}>
        <ModalInfo {...props} confirmButtonFeedBack />
      </Provider>,
    )
    const acceptButton = await screen.findByRole('button', { name: 'Aceptar' })
    expect(acceptButton.closest('div')).toHaveClass(
      'modal-info__confirm-button',
    )
  })
})

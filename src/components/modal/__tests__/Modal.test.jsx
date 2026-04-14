import { createEvent, fireEvent, render, screen } from '@testing-library/react'

import { PlainModal as Modal } from '../Modal'

describe('<Modal />', function () {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('handleKeyDown method', () => {
    it('should call onClose prop if key event is Escape', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: false,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      const escapeKeyEvent = {
        key: 'Escape',
        stopPropagation: vi.fn(),
      }

      render(
        <div>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      fireEvent.keyDown(screen.getByText('Click Aqui'), escapeKeyEvent)

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('should call stopPropagation if key event is Escape', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: false,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      const prueba = vi.fn()

      render(
        <div onKeyDown={prueba}>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      const myEvent = createEvent.keyDown(screen.getByText('Click Aqui'), {
        key: 'Escape',
      })
      myEvent.stopPropagation = vi.fn()
      fireEvent(screen.getByText('Click Aqui'), myEvent)

      expect(myEvent.stopPropagation).toBeCalled()
    })

    it('should don`t call onClose prop and stopPropagation if key event is Enter', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: false,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      render(
        <div>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      const enterKeyEvent = {
        key: 'Enter',
      }

      fireEvent.keyDown(screen.getByText('Click Aqui'), enterKeyEvent)

      expect(props.onClose).not.toBeCalled()
    })

    it('should don`t call stopPropagation if key event is Enter', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: false,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      render(
        <div>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      const myEvent = createEvent.keyDown(screen.getByText('Click Aqui'), {
        key: 'Enter',
      })
      myEvent.stopPropagation = vi.fn()
      fireEvent(screen.getByText('Click Aqui'), myEvent)

      expect(myEvent.stopPropagation).not.toHaveBeenCalled()
    })
  })

  describe('handleClickOutside method', () => {
    it('should call onClose prop if clickout prop is true', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: true,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      render(
        <div>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      fireEvent.click(screen.getByTestId('mask'))

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('should don`t call onClose prop if clickout prop is false', () => {
      const onCloseMock = vi.fn()
      const props = {
        children: '<div></div>',
        onClose: onCloseMock,
        title: 'test title',
        clickout: false,
        ariaLabel: 'tranlation.key',
        actions: {
          toggleModal: vi.fn(),
        },
      }

      render(
        <div>
          <span>Click Aqui</span>
          <Modal {...props} />
        </div>,
      )

      fireEvent.click(screen.getByTestId('mask'))
      expect(onCloseMock).not.toBeCalled()
    })
  })
})

import { act, screen, within } from '@testing-library/react'

import { INTERACTION_EVENTS, VIEW_CHANGE_EVENTS } from '../../../constants'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Tracker } from 'services/tracker'

vi.unmock('@mercadona/mo.library.web-services/cookies')
vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeAll(() => {
  delete window.location
  window.location = { assign: vi.fn(), href: '', replace: vi.fn() }
})
describe('<OnboardingContainer />', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  describe('first time on mercadona online', () => {
    const validPostalCode = '46005'

    it('should exist onboarding with postal code checker', async () => {
      wrap(App).atPath('/').withNetwork().mount()
      expect(
        screen.queryByTestId('postal-code-checker'),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('unavailable-area')).not.toBeInTheDocument()
      const postalCodeChecker = await screen.findByTestId('postal-code-checker')

      expect(postalCodeChecker).toBeInTheDocument()
      expect(Tracker.sendViewChange).toHaveBeenCalledWith(
        VIEW_CHANGE_EVENTS.VOYEUR_MODAL,
      )
    })

    it('should enter to shop when set a valid postal code', async () => {
      wrap(App).atPath('/').withNetwork().mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, validPostalCode)
      const submitButton = screen.getByTestId('postal-code-checker-button')

      await act(async () => userEvent.click(submitButton))

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        INTERACTION_EVENTS.POSTAL_CODE_CONFIRMATION_CLICK,
        { postal_code: validPostalCode },
      )
      expect(screen.queryByTestId('postal-code-step')).not.toBeInTheDocument()
    })

    it('should track the postal code when the user press enter key', async () => {
      wrap(App).atPath('/').withNetwork().mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, validPostalCode)

      await act(async () => userEvent.keyboard('{Enter}'))

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        INTERACTION_EVENTS.POSTAL_CODE_CONFIRMATION_CLICK,
        { postal_code: validPostalCode },
      )
    })

    it('should show a error when set a not exist postal code', async () => {
      const notExistPostalCode = '00000'

      wrap(App).atPath('/').withNetwork().mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, notExistPostalCode)
      userEvent.tab()
      expect(await screen.findByTestId('input-error')).toBeInTheDocument()
    })
  })

  describe('when the postal code is outside the area', () => {
    const unavailablePostalCode = '03730'

    it('should warn that the area is not yet available', async () => {
      const responses = [
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'PUT',
          requestBody: { new_postal_code: '03730' },
          status: 404,
        },
      ]

      wrap(App).atPath('/').withNetwork(responses).mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, unavailablePostalCode)

      userEvent.keyboard('{Enter}')

      const unavailableArea = await screen.findByTestId('unavailable-area')

      expect(unavailableArea).toHaveTextContent(
        /The new Mercadona online service is not available yet in the "03730" postal code.Go to the classic website.Use another postal codeNotify me when it's available in my area/,
      )
    })

    it('should track that the user go to classic version', async () => {
      const responses = [
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'PUT',
          requestBody: { new_postal_code: '03730' },
          status: 404,
        },
      ]

      wrap(App).atPath('/').withNetwork(responses).mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, unavailablePostalCode)

      userEvent.keyboard('{Enter}')

      await screen.findByTestId('unavailable-area')

      userEvent.click(screen.getByTestId('go-to-classic-button'))

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        INTERACTION_EVENTS.GO_TO_CLASSIC_CLICK,
      )
    })

    it('should track that the user retry set postal code', async () => {
      const responses = [
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'PUT',
          requestBody: { new_postal_code: '03730' },
          status: 404,
        },
      ]

      wrap(App).atPath('/').withNetwork(responses).mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, unavailablePostalCode)
      userEvent.keyboard('{Enter}')
      await screen.findByTestId('unavailable-area')

      userEvent.click(screen.getByTestId('enter-another-postal-code-button'))

      const postalCodeInput = await screen.findByTestId(
        'postal-code-checker-input',
      )

      expect(postalCodeInput).not.toHaveValue()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        INTERACTION_EVENTS.RETRY_POSTAL_CODE_CLICK,
      )
    })

    it('should track that the user want be notified', async () => {
      const responses = [
        {
          path: '/postal-codes/actions/change-pc/',
          method: 'PUT',
          requestBody: { new_postal_code: '03730' },
          status: 404,
        },
      ]

      wrap(App).atPath('/').withNetwork(responses).mount()

      const postalCodeChecker = await screen.findByTestId(
        'postal-code-checker-input',
      )
      userEvent.type(postalCodeChecker, unavailablePostalCode)
      userEvent.keyboard('{Enter}')
      await screen.findByTestId('unavailable-area')

      userEvent.click(screen.getByTestId('notify-me-button'))

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        INTERACTION_EVENTS.NOTIFY_ME_CLICK,
      )
    })

    describe('and I want to subscribe to future releases', () => {
      it('should track when the user press enter key', async () => {
        const responses = [
          {
            path: '/postal-codes/actions/change-pc/',
            method: 'PUT',
            requestBody: { new_postal_code: '03730' },
            status: 404,
          },
        ]

        wrap(App).atPath('/').withNetwork(responses).mount()

        const postalCodeChecker = await screen.findByTestId(
          'postal-code-checker-input',
        )
        userEvent.type(postalCodeChecker, unavailablePostalCode)
        await act(async () => userEvent.keyboard('{Enter}'))
        await screen.findByTestId('unavailable-area')

        userEvent.click(screen.getByTestId('notify-me-button'))

        const notifyMeContainer = await screen.findByTestId('notify-me')

        userEvent.type(
          within(notifyMeContainer).getByTestId('notify-me-email-input'),
          'hello@mercadona.es',
        )

        userEvent.type(
          within(notifyMeContainer).getByTestId('notify-me-postal-code-input'),
          '03730',
        )

        await act(async () => userEvent.keyboard('{Enter}'))

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          INTERACTION_EVENTS.NOTIFY_ME_CONFIRMATION,
          {
            email: 'hello@mercadona.es',
            postal_code: '03730',
            is_valid: true,
          },
        )
      })

      describe('and the user have a valid email and postal code', () => {
        const options = {
          email: 'hello@mercadona.es',
          postal_code: unavailablePostalCode,
          is_valid: true,
        }

        it('should track that the user go to classic version when be notified', async () => {
          const responses = [
            {
              path: '/postal-codes/actions/change-pc/',
              method: 'PUT',
              requestBody: { new_postal_code: '03730' },
              status: 404,
            },
          ]

          wrap(App).atPath('/').withNetwork(responses).mount()

          const postalCodeChecker = await screen.findByTestId(
            'postal-code-checker-input',
          )
          userEvent.type(postalCodeChecker, unavailablePostalCode)
          await act(async () => userEvent.keyboard('{Enter}'))
          await screen.findByTestId('unavailable-area')

          userEvent.click(screen.getByTestId('notify-me-button'))

          const notifyMeContainer = await screen.findByTestId('notify-me')

          userEvent.type(
            within(notifyMeContainer).getByTestId('notify-me-email-input'),
            'hello@mercadona.es',
          )

          userEvent.type(
            within(notifyMeContainer).getByTestId(
              'notify-me-postal-code-input',
            ),
            '03730',
          )

          await act(async () =>
            userEvent.click(
              within(notifyMeContainer).getByTestId('notify-me-send-button'),
            ),
          )

          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            INTERACTION_EVENTS.NOTIFY_ME_CONFIRMATION,
            options,
          )
        })

        it('should track that the user go to landing when be notified', async () => {
          const responses = [
            {
              path: '/postal-codes/actions/change-pc/',
              method: 'PUT',
              requestBody: { new_postal_code: '03730' },
              status: 404,
            },
            {
              path: '/home/',
              requestBody: undefined,
            },
            {
              path: '/newsletter/',
              method: 'POST',
              requestBody: {
                email: 'hello@mercadona.es',
                mailing_list: 'new_postal_code',
                params: { postal_code: '03730' },
              },
            },
          ]

          wrap(App).atPath('/').withNetwork(responses).mount()

          const postalCodeChecker = await screen.findByTestId(
            'postal-code-checker-input',
          )
          userEvent.type(postalCodeChecker, unavailablePostalCode)
          userEvent.keyboard('{Enter}')
          await screen.findByTestId('unavailable-area')

          userEvent.click(screen.getByTestId('notify-me-button'))

          const notifyMeContainer = await screen.findByTestId('notify-me')

          userEvent.type(
            within(notifyMeContainer).getByTestId('notify-me-email-input'),
            'hello@mercadona.es',
          )

          userEvent.type(
            within(notifyMeContainer).getByTestId(
              'notify-me-postal-code-input',
            ),
            '03730',
          )
          userEvent.click(screen.getByTestId('notify-me-send-button'))

          await screen.findByTestId('thank-you')

          userEvent.click(screen.getByTestId('thank-you-button'))

          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            INTERACTION_EVENTS.GO_TO_LANDING_CLICK,
          )
        })
      })

      describe('and the user have a invalid email or postal code', () => {
        it('should track the invalid options', async () => {
          const responses = [
            {
              path: '/postal-codes/actions/change-pc/',
              method: 'PUT',
              requestBody: { new_postal_code: '03730' },
              status: 404,
            },
          ]

          wrap(App).atPath('/').withNetwork(responses).mount()

          const postalCodeChecker = await screen.findByTestId(
            'postal-code-checker-input',
          )
          userEvent.type(postalCodeChecker, unavailablePostalCode)
          userEvent.keyboard('{Enter}')
          await screen.findByTestId('unavailable-area')

          userEvent.click(screen.getByTestId('notify-me-button'))

          const notifyMeContainer = await screen.findByTestId('notify-me')

          userEvent.click(
            within(notifyMeContainer).getByTestId('notify-me-send-button'),
          )

          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            INTERACTION_EVENTS.NOTIFY_ME_CONFIRMATION,
            {
              email: undefined,
              postal_code: undefined,
              is_valid: false,
            },
          )
        })
      })
    })
  })

  it('should redirect to home and show the modal asking the postal code when there is an url different from ONBOARDING_URLS', async () => {
    const pushSpy = vi.spyOn(history, 'push')

    const homeUrl = '/'
    wrap(App).atPath('/a-fake-path').withNetwork().mount()

    await screen.findByText(
      'Enter your postal code in order to access your shop',
    )

    expect(pushSpy).toHaveBeenCalledWith(homeUrl)
  })

  it('has a postal code already should not exist', () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()
    expect(screen.queryByTestId('postal-code-checker')).not.toBeInTheDocument()
    expect(screen.queryByTestId('unavailable-area')).not.toBeInTheDocument()
  })
})

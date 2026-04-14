import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  homeWithDeferredInfo,
  homeWithInfo,
  homeWithWarning,
} from 'app/catalog/__scenarios__/home'
import { CatalogClient } from 'app/catalog/client'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home section layout notification', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
    Storage.clear()
    localStorage.clear()
  })

  describe('When type is "warning"', () => {
    it('should show the notification with warning style', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithWarning,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: 'Warning triangle',
      })

      expect(notification).toBeInTheDocument()
      expect(notification).toHaveTextContent(
        'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      )
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'no_availability_alert',
        {
          message:
            'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
        },
      )
    })

    it('should track click event', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithWarning,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
      })

      userEvent.click(notification)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'no_availability_alert_click',
        {
          message:
            'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.',
        },
      )
    })
  })

  describe('When type is "info"', () => {
    it('should show the notification with info style', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithInfo,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Siguiente fecha de entrega en 5 días naturales.',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: '',
      })

      expect(notification).toBeInTheDocument()
      expect(notification).toHaveTextContent(
        'Siguiente fecha de entrega en 5 días naturales.',
      )
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'low_availability_alert',
        {
          message: 'Siguiente fecha de entrega en 5 días naturales.',
        },
      )
    })

    it('should track click event', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithInfo,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Siguiente fecha de entrega en 5 días naturales.',
      })

      userEvent.click(notification)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'low_availability_alert_click',
        {
          message: 'Siguiente fecha de entrega en 5 días naturales.',
        },
      )
    })
  })

  describe('When type is deferred "info"', () => {
    it('should show the notification with info style and loading', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithDeferredInfo,
          },
          {
            path: '/deferred-path-url/',
            responseBody: {
              title: 'Information after fetch deferred fetch',
              type: 'info',
              event_key: 'EventKeyDeferred',
              api_path: '/deferred-path-url/',
            },
            delay: 5000,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Loading',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: '',
      })

      expect(notification).toHaveAttribute('aria-live', 'polite')
      expect(notification).toHaveAttribute('aria-busy', 'true')
      expect(notification).toHaveTextContent('')
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
        expect.anything(),
        {
          message: expect.anything(),
        },
      )
    })

    it('should show the notification with deferred info response', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithDeferredInfo,
          },
          {
            path: '/deferred-path-url/',
            responseBody: {
              title: 'Information after fetch deferred fetch',
              type: 'info',
              event_key: 'EventKeyDeferred',
              api_path: '/deferred-path-url/',
            },
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Information after fetch deferred fetch',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: '',
      })

      expect(notification).not.toHaveAttribute('aria-live', 'polite')
      expect(notification).not.toHaveAttribute('aria-busy', 'true')
      expect(notification).toHaveTextContent(
        'Information after fetch deferred fetch',
      )
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('EventKeyDeferred', {
        message: 'Information after fetch deferred fetch',
      })
    })

    it('should show the notification with deferred warning response', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithDeferredInfo,
          },
          {
            path: '/deferred-path-url/',
            responseBody: {
              title: 'Information after fetch deferred fetch',
              type: 'warning',
              event_key: 'EventKeyDeferred',
              api_path: '/deferred-path-url/',
            },
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Information after fetch deferred fetch',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: 'Warning triangle',
      })

      expect(notification).not.toHaveAttribute('aria-live', 'polite')
      expect(notification).not.toHaveAttribute('aria-busy', 'true')
      expect(notification).toHaveTextContent(
        'Information after fetch deferred fetch',
      )
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('EventKeyDeferred', {
        message: 'Information after fetch deferred fetch',
      })
    })

    describe('When is anonymous', () => {
      it('should call without authenticate to fetch deferred details', async () => {
        vi.spyOn(CatalogClient, 'getSectionDynamicDetails')
        vi.spyOn(CatalogClient, 'getSectionAuthDynamicDetails')

        wrap(App)
          .atPath('/')
          .withNetwork([
            {
              path: '/home/',
              responseBody: homeWithDeferredInfo,
            },
            {
              path: '/deferred-path-url/?lang=en&wh=vlc1&postal_code=46010',
              responseBody: {
                title: 'Information after fetch deferred fetch',
                type: 'warning',
                event_key: 'EventKeyDeferred',
              },
              catchParams: true,
            },
          ])
          .mount()

        await screen.findByRole('marquee', {
          name: 'Information after fetch deferred fetch',
        })

        expect(CatalogClient.getSectionDynamicDetails).toHaveBeenCalledWith({
          apiPath: '/deferred-path-url/',
          postalCode: '46010',
        })
        expect(
          CatalogClient.getSectionAuthDynamicDetails,
        ).not.toHaveBeenCalled()
      })
    })

    describe('When is authenticated', () => {
      it('should call with authenticate to fetch deferred details', async () => {
        vi.spyOn(CatalogClient, 'getSectionDynamicDetails')
        vi.spyOn(CatalogClient, 'getSectionAuthDynamicDetails')

        wrap(App)
          .atPath('/')
          .withLogin()
          .withNetwork([
            {
              path: '/customers/1/home/',
              responseBody: homeWithDeferredInfo,
            },
            {
              path: '/deferred-path-url/?lang=en&wh=vlc1',
              responseBody: {
                title: 'Information after fetch deferred fetch',
                type: 'warning',
                event_key: 'EventKeyDeferred',
              },
              catchParams: true,
            },
          ])
          .mount()

        await screen.findByRole('marquee', {
          name: 'Information after fetch deferred fetch',
        })

        expect(CatalogClient.getSectionAuthDynamicDetails).toHaveBeenCalledWith(
          {
            apiPath: '/deferred-path-url/',
          },
        )
        expect(CatalogClient.getSectionDynamicDetails).not.toHaveBeenCalled()
      })
    })

    it('should send metric on click the notification with deferred response', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithDeferredInfo,
          },
          {
            path: '/deferred-path-url/',
            responseBody: {
              title: 'Information after fetch deferred fetch',
              type: 'info',
              event_key: 'EventKeyDeferred',
              api_path: '/deferred-path-url/',
            },
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Information after fetch deferred fetch',
      })

      userEvent.click(notification)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'EventKeyDeferred_click',
        {
          message: 'Information after fetch deferred fetch',
        },
      )
    })

    it('should show the notification with info style and loading on fails', async () => {
      wrap(App)
        .atPath('/')
        .withNetwork([
          {
            path: '/home/',
            responseBody: homeWithDeferredInfo,
          },
          {
            path: '/deferred-path-url/',
            status: 500,
          },
        ])
        .mount()

      const notification = await screen.findByRole('marquee', {
        name: 'Loading',
      })

      const notificationImage = within(notification).getByRole('img', {
        name: '',
      })

      expect(notification).toHaveAttribute('aria-live', 'polite')
      expect(notification).toHaveAttribute('aria-busy', 'true')
      expect(notification).toHaveTextContent('')
      expect(notificationImage).toBeInTheDocument()
      expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
        expect.anything(),
        {
          message: expect.anything(),
        },
      )
    })
  })
})

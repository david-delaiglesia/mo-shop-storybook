import { screen, waitFor, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  homeWithBannerProduct,
  homeWithDeliveredWidget,
  homeWithGrid,
  homeWithMultipleBanners,
  homeWithPreparingWidget,
  homeWithWarning,
} from 'app/catalog/__scenarios__/home'
import {
  goToHome,
  pressEnterKey,
  pressSpaceKey,
  pressTabKey,
  pressVOKey,
  useMouse,
} from 'pages/home/__tests__/helpers'
import { goToMyLists } from 'pages/season/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home Accessibility', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('should show skip to content link on focus', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()
    await screen.findByText('Novedades')

    pressTabKey()

    expect(screen.getByText('Go to content')).toHaveFocus()
  })

  it('should not show skip to content link on focus', async () => {
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/categories/112').withNetwork(responses).mount()
    await screen.findByText('Aceite, vinagre y sal')

    expect(screen.queryByText('Go to content')).not.toBeInTheDocument()
  })

  it('should configure the page for keyboard user after pressing the tab key', async () => {
    const listenerSpy = vi.spyOn(document, 'addEventListener')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    useMouse()

    expect(document.body).not.toHaveClass('keyboard-user')

    pressTabKey()

    expect(document.body).toHaveClass('keyboard-user')
    expect(listenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(listenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
  })

  it('logs when a user presses the tab key', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    pressTabKey()
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('a11y_tab_key', {
      target: 'Go to content',
    })
  })

  it('logs when a user presses the VoiceOver key (screen reader)', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    pressVOKey('{ArrowRight}')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('a11y_vo_key', {
      key: 'ArrowRight',
    })
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith('a11y_vo_key', {
      key: 'Control',
    })
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith('a11y_vo_key', {
      key: 'Alt',
    })
  })

  it('logs when a user presses the Space key', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    pressTabKey()
    pressSpaceKey()
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('a11y_space_key', {
      target: 'Go to content',
    })
  })

  it('logs when a user presses the Enter key', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    pressTabKey()
    pressEnterKey()
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('a11y_enter_key', {
      target: 'Go to content',
    })
  })

  it('should focus on content when navigating back to home', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: homeWithGrid,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Novedades')
    goToMyLists()

    await screen.findByText('My first list')
    goToHome()

    await screen.findByText('Novedades')
    await waitFor(() => {
      expect(window.location.href).toContain('#content')
    })
  })

  it('should have delivery notifications accessible', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/home/',
          responseBody: homeWithWarning,
          delay: 300,
        },
      ])
      .mount()

    const notificationText =
      'Sentimos las molestias, actualmente no hay tramos de reparto disponibles.'

    const notification = await screen.findByRole('marquee', {
      name: notificationText,
    })

    expect(within(notification).getByText(notificationText)).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(notification).toHaveAttribute('tabindex', '0')
  })

  it('should show accessible delivery order', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: homeWithPreparingWidget,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')

    const orderListItem = screen.getByRole('listitem', {
      name: 'Order 1002, PreparingDelivery tomorrow from 16:00 to 17:00',
    })
    const orderNumberDiv = within(orderListItem)
      .getByText('Order 1002')
      .closest('div')

    expect(orderNumberDiv).toHaveAttribute('aria-hidden', 'true')
    expect(orderListItem).toBeInTheDocument()
  })

  it('should show accessible delivered orders', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithDeliveredWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    const orderListItem = screen.getByRole('listitem', {
      name: 'Order 1005, Delivered, Tell us how it was.',
    })
    const orderNumberDiv = within(orderListItem)
      .getByText('Order 1005')
      .closest('div')

    expect(orderNumberDiv).toHaveAttribute('aria-hidden', 'true')
    expect(orderListItem).toBeInTheDocument()
  })

  it('should show accessible banner', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const bannerTitle = await screen.findByRole('heading', {
      level: 2,
      name: 'Productos del momento',
    })

    expect(
      screen.getByLabelText('Para tu San Valentín, Tap to view the products'),
    ).toBeInTheDocument()
    expect(bannerTitle.closest('div')).toHaveAttribute('tabindex', '0')
    expect(screen.getByLabelText('arrow--right')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('should show accessible highlighted product', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Lists')

    const highlightedProduct = screen.getByRole('button', {
      name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    })
    const productPriceButton = screen.getByText('0,85 €').closest('button')

    expect(highlightedProduct).toBeInTheDocument()
    expect(productPriceButton).toHaveAttribute('tabindex', '-1')
    expect(productPriceButton).toHaveAttribute('aria-hidden', 'true')
  })
})

import { screen, within } from '@testing-library/react'

import { waitForCartItemRemovedAnnouncement } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { confirmCleanCartAlert, openCart, pressEnter } from 'pages/helpers'
import {
  emptyCart,
  openCartActionsMenu,
  openSortingDropdown,
  sortByCategory,
} from 'pages/home/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Cart - Accessibility', () => {
  beforeEach(() => {
    Cookie.get = vi.fn().mockReturnValue({ postalCode: '46010' })
    vi.useFakeTimers()
  })

  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]

  it('should have the right aria properties for the order dropdown', async () => {
    activeFeatureFlags(['web-accessibility-cart'])

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    openCart()
    openSortingDropdown()

    const sortText = screen.getByText('Sort')
    const sortDropdown = screen.getByRole('menu')
    const asTheyWereAddedOption = screen.getByRole('menuitem', {
      name: 'As they were added',
    })
    const byCategoryOption = screen.getByRole('menuitem', {
      name: 'By category',
    })
    const cartSelector = screen.getByTestId('cart-sorting-method-selector')
    const cartSelectorButton = within(cartSelector).getByRole('button', {
      name: 'Sort products As they were added',
    })

    expect(cartSelectorButton).toHaveAttribute('aria-haspopup', 'true')
    expect(sortText).toHaveAttribute('aria-hidden', 'true')
    expect(sortText.parentElement).toHaveAttribute('tabindex', '0')
    expect(sortDropdown).toHaveAttribute('tabindex', '0')
    expect(asTheyWereAddedOption).toHaveAttribute('tabindex', '0')
    expect(byCategoryOption).toHaveAttribute('tabindex', '0')
  })

  it('should have the right aria properties for cart items', async () => {
    activeFeatureFlags(['web-accessibility-cart'])

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    const cartSidebar = await screen.findByTestId('cart')

    openCart()
    openSortingDropdown()
    sortByCategory()

    const productDescriptionDiv = within(cartSidebar).getByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    ).parentElement
    const approximateTotalDiv = screen.getByLabelText(
      'Approximate total 1,70 €. Click to see more information.',
    )
    const toolTipDiv = screen.getByTestId('cart-approximate-total-tooltip')
    const deliveryText = screen.getByText('Delivery in 46010')

    expect(screen.getByText('Arroz, legumbres y pasta')).toHaveAttribute(
      'tabindex',
      '0',
    )
    expect(
      within(cartSidebar).getByRole('button', {
        name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
      }),
    ).toBeInTheDocument()

    expect(deliveryText).toHaveAttribute(
      'aria-label',
      'Deliver to postcode 46010',
    )
    expect(productDescriptionDiv).toHaveAttribute('tabindex', '-1')
    expect(productDescriptionDiv).toHaveAttribute('aria-hidden', 'true')
    expect(toolTipDiv).toHaveAttribute('aria-hidden', 'true')
    expect(approximateTotalDiv).toHaveAttribute('tabindex', '0')
  })

  it('should display tooltip after pressing enter in approximate total', async () => {
    activeFeatureFlags(['web-accessibility-cart'])

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    openCart()
    openSortingDropdown()

    const toolTipDiv = screen.getByTestId('cart-approximate-total-tooltip')
    pressEnter(toolTipDiv)

    const tooltipTip = within(toolTipDiv).getByRole('tooltip', { hidden: true })

    expect(tooltipTip).toBeInTheDocument()
    expect(tooltipTip).toHaveTextContent(
      'For products sold by weight, the amount charged will be adjusted to the quantity served. Charging of the final amount will be made after the preparation of your order.',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('price_detail_click')
  })

  it('should display empty cart feedback when emptying cart', async () => {
    vi.useRealTimers()
    activeFeatureFlags(['web-accessibility-cart'])

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    openCart()
    openCartActionsMenu()
    emptyCart()

    expect(
      screen.getByRole('dialog', {
        name: 'Empty cart. Are you sure you want to empty your cart?',
      }),
    ).toBeInTheDocument()
    confirmCleanCartAlert()

    await waitForCartItemRemovedAnnouncement()

    expect(screen.getByText('Cart is empty')).toBeInTheDocument()
  })

  it('should have accessible empty cart message', async () => {
    activeFeatureFlags(['web-accessibility-cart'])

    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const emptyCartMessage = screen.getByText(
      'You have not yet added any products to your cart',
    )
    const emptyCartImage = screen.getByAltText('empty-cart')

    expect(emptyCartMessage).toHaveAttribute('tabindex', '0')
    expect(emptyCartImage).toHaveAttribute('aria-hidden', 'true')
  })
})

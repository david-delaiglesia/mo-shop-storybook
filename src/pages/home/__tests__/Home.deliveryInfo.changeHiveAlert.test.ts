import { act, screen, waitFor } from '@testing-library/react'

import {
  addNewAddress,
  clickOnCategory,
  clickOnPostalCode,
  confirmAddressForm,
  confirmChangeOfAddressModal,
  confirmPostalCodeForm,
  confirmWarehouseChangedModal,
  fillPostalCodeForm,
  goToCarouselDetail,
  goToEditOrder,
  goToHome,
  openCart,
  openChangeAddressModal,
  openChangeAddressModalFromUserMenu,
  openLoggedUserDropdown,
  openUserDropdown,
  saveAddressForm,
  selectAddressFromList,
} from './helpers'
import { NetworkResponses, configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  address,
  addressFormFill,
  addressFromDifferentWarehouse,
  addressRequest,
  addressRequestAccuracy,
} from 'app/address/__scenarios__/address'
import {
  cart,
  cartWithOneUnpublishedProduct,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  homeWithCarousel,
  homeWithConfirmedWidget,
  homeWithGrid,
  homeWithGridAndProductNotAvailableInMad,
} from 'app/catalog/__scenarios__/home'
import { productBase, productWithBulk } from 'app/catalog/__scenarios__/product'
import { checkoutWithAddressConfirmationRequired } from 'app/checkout/__scenarios__/checkout'
import {
  cookies,
  cookiesWithMadWarehouse,
} from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { slotsMock } from 'containers/slots-container/__tests__/mocks'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import { cancelLoginSuggestion } from 'pages/authenticate-user/__tests__/helpers'
import { addProduct } from 'pages/helpers'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { clickElementDefaultButton } from 'pages/user-area/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

interface CustomHeaders extends Headers {
  'x-customer-pc': string
  'x-customer-wh': string
}

describe('Change hive alert', () => {
  const vlc1PostalCode = '46010'
  const mad1PostalCode = '28001'

  const defaultResponses = [
    {
      path: '/home/?postal_code=46010&lang=es&wh=vlc1',
      responseBody: homeWithGrid,
    },
  ]

  configure({
    changeRoute: (route) => history.push(route),
  })

  const pathnameMock = vi.fn()
  Object.defineProperty(window, 'location', {
    value: {
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
      href: '',
    },
    writable: true,
  })
  Object.defineProperty(window.location, 'pathname', {
    set: pathnameMock,
    get: () => pathnameMock,
    configurable: true,
  })

  beforeEach(() => {
    Cookie.get = vi.fn((cookie: string) => cookies[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    vi.useFakeTimers()
    global.IntersectionObserver =
      IntersectionObserverMock as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Storage.clear()
    localStorage.clear()
    vi.useRealTimers()
  })

  const addProductToLocalCartAndSimulateHomePageReload = async () => {
    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findAllByRole('dialog')
    cancelLoginSuggestion()
    navigateToShoppingLists()
    await screen.findByRole('button', { name: 'Login' })
    goToHome()
    await screen.findByText('Novedades')
  }

  it('should show the change hive alert when an unregister user changes the CP and the cart is not empty', async () => {
    const responses: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/postal-codes/actions/change-pc/?lang=es&wh=vlc1',
        method: 'put',
        requestBody: { new_postal_code: mad1PostalCode },
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await addProductToLocalCartAndSimulateHomePageReload()
    openUserDropdown()
    openChangeAddressModalFromUserMenu(vlc1PostalCode)
    fillPostalCodeForm(mad1PostalCode)
    confirmPostalCodeForm()
    expect(
      await screen.findByText('Products not available at this address'),
    ).toBeInTheDocument()
  })

  it('should show the changed hive when logged user adds a new address', async () => {
    const responses = [
      ...new AddressResponsesBuilder()
        .addGetResponse([address])
        .addCreationResponse(addressRequest, addressFromDifferentWarehouse)
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
        .build(),
      ...new DeliveryAreaResponsesBuilder()
        .addPostalCodeValidationResponse()
        .build(),
      {
        path: `/customers/1/home/?lang=es&wh=vlc1`,
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/1/addresses/1/make_default/?lang=es&wh=mad1`,
        method: 'patch',
        responseBody: { ...addressFromDifferentWarehouse },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')

    openLoggedUserDropdown('John')
    openChangeAddressModalFromUserMenu(vlc1PostalCode)
    await screen.findByText('Calle Arquitecto Mora, 10')
    addNewAddress()
    await screen.findByText('Street and number')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddressForm()

    await waitFor(() => {
      expect(screen.queryByText('Street name')).not.toBeInTheDocument()
    })
  })

  it('should show the change hive alert with the proper information', async () => {
    const responses: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/postal-codes/actions/change-pc/?lang=es&wh=vlc1',
        method: 'put',
        requestBody: { new_postal_code: mad1PostalCode },
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await addProductToLocalCartAndSimulateHomePageReload()
    openUserDropdown()
    openChangeAddressModalFromUserMenu(vlc1PostalCode)
    fillPostalCodeForm(mad1PostalCode)

    confirmPostalCodeForm()

    await screen.findByText('Products not available at this address')

    expect(
      screen.getByText('Products not available at this address'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'When changing direction the catalog has changed. Check your cart if you had added something.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Check your shopping trolley')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_hive_alert_view',
      {
        reason: 'unnecessary',
      },
    )
  })

  it('should keep the shopping trolley open once you confirm the warehouseChangedModal checking the new PostalCode', async () => {
    const responses: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/postal-codes/actions/change-pc/?lang=es&wh=vlc1',
        method: 'put',
        requestBody: { new_postal_code: mad1PostalCode },
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await addProductToLocalCartAndSimulateHomePageReload()
    openUserDropdown()
    openChangeAddressModalFromUserMenu(vlc1PostalCode)
    fillPostalCodeForm(mad1PostalCode)

    confirmPostalCodeForm()

    const newPostalCode = await screen.findByText('Delivery in 28001')

    await screen.findByText('Products not available at this address')

    confirmWarehouseChangedModal()
    expect(newPostalCode).toBeInTheDocument()
  })

  it('should show the change hive from the user account and load the cart with the new hive', async () => {
    const uuid = '1'
    const responses: NetworkResponses = [
      {
        path: `/customers/${uuid}/home/?lang=es&wh=vlc1`,
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/${uuid}/addresses/?lang=es&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/${uuid}/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cartWithOneUnpublishedProduct,
      },
    ]
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Addresses' })
    clickElementDefaultButton('Calle Mayor, 10')

    await screen.findByText('Products not available at this address')
    await screen.findByText('Check your shopping trolley')
    confirmWarehouseChangedModal()
    await waitFor(async () => {
      expect(
        screen.getByRole('button', {
          name: 'Deliver to postcode 28001',
        }),
      ).toBeInTheDocument()
    })
  })

  it('should change the warehouse and update the catalog and the postalCode of the delivery', async () => {
    const responses: NetworkResponses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc1',
        responseBody: homeWithGridAndProductNotAvailableInMad,
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/home/?lang=en&wh=mad1',
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')

    openCart()
    openChangeAddressModal(vlc1PostalCode)
    await screen.findByText(mad1PostalCode)
    clickOnPostalCode(mad1PostalCode)

    confirmAddressForm()

    Cookie.get = vi.fn((cookie: string) => cookiesWithMadWarehouse[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()

    expect('/customers/1/home/?lang=en&wh=mad1').toHaveBeenFetchedTimes(1)
  })

  it('should change the warehouse and update the category and the postalCode of the delivery', async () => {
    const responses: NetworkResponses = [
      {
        path: '/categories/?lang=en&wh=vlc1',
        responseBody: categories,
      },
      {
        path: '/categories/112/?lang=en&wh=vlc1',
        responseBody: categories,
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        method: 'delete',
        path: `/customers/1/payment-cards/`,
        status: 204,
      },
      {
        path: '/categories/112/?lang=en&wh=mad1',
        responseBody: categories,
      },
    ]
    wrap(App)
      .atPath('/categories/112/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByLabelText('Show cart')

    openCart()
    openChangeAddressModal(vlc1PostalCode)
    await screen.findByText(mad1PostalCode)
    clickOnPostalCode(mad1PostalCode)

    confirmAddressForm()

    Cookie.get = vi.fn((cookie: string) => cookiesWithMadWarehouse[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()

    expect('/categories/112/?lang=en&wh=mad1').toHaveBeenFetchedTimes(1)
  })

  it('should go to modify an order and get the order warehouse, not the session warehouse', async () => {
    const responses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc',
        responseBody: homeWithConfirmedWidget,
      },
      {
        path: '/customers/1/orders/1001/?lang=en&wh=vlc',
        responseBody: {
          ...mockedOrder,
          warehouse_code: 'mad1',
          id: 1001,
          order_id: 1001,
        },
      },
      { path: '/customers/1/orders/1001/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: `/categories/112/?lang=en&wh=mad1`,
        responseBody: categoryDetail,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    openCart()

    await screen.findByText('Delivery in 46010')
    goToEditOrder()
    await screen.findByText('Products in my order')

    clickOnCategory()
    await screen.findByRole('button', {
      name: 'Bebé',
    })
    expect(
      '/categories/112/?lang=en&wh=mad1&display_temporarily_unavailable=false',
    ).toHaveBeenFetched()
  })

  it('should change the address check and do not show the modal', async () => {
    const responses: NetworkResponses = [
      ...defaultResponses,
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cart,
      },
      {
        path: `/customers/1/home/?lang=en&wh=mad1`,
        responseBody: homeWithGrid,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')

    openCart()
    openChangeAddressModal(vlc1PostalCode)
    await screen.findByText(mad1PostalCode)
    clickOnPostalCode(mad1PostalCode)
    confirmAddressForm()
    expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()
  })

  it('should send change_hive_alert_view with reason unpublished_products when showUnpublishedProductsAlert is triggered', async () => {
    const responses: NetworkResponses = [
      {
        path: `/customers/1/home/?lang=es&wh=vlc1`,
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/1/addresses/?lang=es&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cartWithOneUnpublishedProduct,
      },
    ]
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Addresses' })
    clickElementDefaultButton('Calle Mayor, 10')

    await screen.findByText('Products not available at this address')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_hive_alert_view',
      {
        reason: 'unpublished_products',
      },
    )
  })

  it('should send change_hive_alert_view with reason unnecessary when showWarehouseChangesAlert is triggered', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/addresses/3/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/addresses/1/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
    ]
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responses)
      .withLogin({ cart: cart })
      .mount()

    await screen.findByText('Delivery')
    await screen.findByText('Calle Mayor, 10')

    selectAddressFromList('Calle Mayor, 10')
    confirmAddressForm()
    await screen.findByRole('dialog')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_hive_alert_view',
      {
        reason: 'unnecessary',
      },
    )
  })

  it('should display the changeCatalog modal when selects another address from a different warehouse without unpublished products', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/addresses/3/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/addresses/1/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
    ]
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responses)
      .withLogin({ cart: cart })
      .mount()

    await screen.findByText('Delivery')
    await screen.findByText('Calle Mayor, 10')

    selectAddressFromList('Calle Mayor, 10')
    confirmAddressForm()
    await screen.findByRole('dialog')
    expect(
      screen.getByText(
        'Availability may vary if the address is changed. Process the order again.',
      ),
    ).toBeInTheDocument()
  })

  it('should display the changeAddress modal when selects another address from a different warehouse', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/addresses/3/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/addresses/1/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
    ]
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responses)
      .withLogin({ cart: cartWithOneUnpublishedProduct })
      .mount()

    await screen.findByText('Delivery')
    await screen.findByText('Calle Mayor, 10')

    selectAddressFromList('Calle Mayor, 10')
    confirmAddressForm()
    await screen.findByRole('dialog')
    expect(
      screen.getByText(
        'Availability may vary if the address is changed. Process the order again.',
      ),
    ).toBeInTheDocument()
  })

  it('should not display the changeWarehouse modal when selects another address from a different warehouse in the trolley after selecting the address in the checkout', async () => {
    const responses: NetworkResponses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: '/customers/1/addresses/3/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/addresses/1/slots/?lang=en&wh=vlc1&size=0',
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/home/?lang=en&wh=vlc',
        responseBody: homeWithCarousel,
      },
      {
        path: `/customers/1/addresses/${address.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: address,
        headers: {
          'x-customer-pc': vlc1PostalCode,
          'x-customer-wh': 'vlc1',
        } as CustomHeaders,
      },
    ]
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responses)
      .withLogin({ cart: cartWithOneUnpublishedProduct })
      .mount()

    await screen.findByText('Delivery')
    await screen.findByText('Calle Mayor, 10')

    selectAddressFromList('Calle Mayor, 10')
    confirmAddressForm()
    await screen.findByRole('dialog')

    const messageOnModal = screen.queryByText(
      'When you change the address, some products will no longer be available in your shopping trolley',
    )

    confirmChangeOfAddressModal()
    await screen.findByLabelText('Show cart')
    openCart()

    openChangeAddressModal(mad1PostalCode)
    await screen.findByText(vlc1PostalCode)
    clickOnPostalCode(vlc1PostalCode)
    confirmAddressForm()
    await screen.findByText('Delivery in 46010')

    expect(messageOnModal).not.toBeInTheDocument()
  })

  it('should go to newsArrivals, go back home, change the address, go to newArrivals again and check that is calling with the new warehouse', async () => {
    const responses: NetworkResponses = [
      {
        path: '/customers/1/home/?lang=en&wh=vlc',
        responseBody: homeWithCarousel,
      },
      {
        path: '/customers/1/home/new-arrivals/?lang=en&wh=vlc1',
        responseBody: {
          layout: 'detail',
          source: 'new-arrivals',
          source_code: 'NA',
          title: 'Novedades',
          items: [{ ...productBase }],
        },
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cart,
      },
      {
        path: `/customers/1/home/?lang=en&wh=mad1`,
        responseBody: homeWithCarousel,
      },
      {
        path: '/customers/1/home/new-arrivals/?lang=en&wh=mad',
        responseBody: {
          layout: 'detail',
          source: 'new-arrivals',
          source_code: 'NA',
          title: 'Novedades',
          items: [{ ...productBase }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Productos recién añadidos o mejorados')

    screen.getByRole('button', {
      name: 'Deliver to postcode 46010',
    })
    goToCarouselDetail()
    expect(
      'customers/1/home/new-arrivals/?lang=en&wh=vlc1',
    ).toHaveBeenFetchedTimes(1)

    await screen.findByRole('heading', { name: 'Novedades' })

    goToHome()
    openCart()
    openChangeAddressModal(vlc1PostalCode)
    await screen.findByText(mad1PostalCode)
    clickOnPostalCode(mad1PostalCode)
    confirmAddressForm()
    expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()
    Cookie.get = vi.fn((cookie: string) => cookiesWithMadWarehouse[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    await act(async () => {
      goToCarouselDetail()
    })
    expect(
      'customers/1/home/new-arrivals/?lang=en&wh=mad1',
    ).toHaveBeenFetchedTimes(1)
  })

  it('should check that the page newArrivals reloads if the user changes the warehouse', async () => {
    const responses: NetworkResponses = [
      {
        path: '/customers/1/home/new-arrivals/?lang=en&wh=vlc1',
        responseBody: {
          layout: 'detail',
          source: 'new-arrivals',
          source_code: 'NA',
          title: 'Novedades',
          items: [{ ...productBase }],
        },
      },
      {
        path: `/customers/1/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: {
          'x-customer-pc': mad1PostalCode,
          'x-customer-wh': 'mad1',
        } as CustomHeaders,
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cart,
      },
      {
        path: '/customers/1/home/new-arrivals/?lang=en&wh=mad1',
        responseBody: {
          layout: 'detail',
          source: 'new-arrivals',
          source_code: 'NA',
          title: 'Novedades',
          items: [{ ...productWithBulk }],
        },
      },
    ]
    wrap(App)
      .atPath('/home/new-arrivals')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Novedades' })

    expect(
      'customers/1/home/new-arrivals/?lang=en&wh=vlc1',
    ).toHaveBeenFetchedTimes(1)

    openCart()
    expect(await screen.findByText('Delivery in 46010')).toBeInTheDocument()
    openChangeAddressModal(vlc1PostalCode)
    await screen.findByText(mad1PostalCode)
    clickOnPostalCode(mad1PostalCode)
    confirmAddressForm()
    Cookie.get = vi.fn((cookie: string) => cookiesWithMadWarehouse[cookie]) as <
      CookieValueType,
    >(
      cookieName: string,
    ) => CookieValueType
    expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()
    expect('customers/1/home/new-arrivals/?lang=en&wh=mad1').toHaveBeenFetched()
  })
})

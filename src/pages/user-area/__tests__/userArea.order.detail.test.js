import { screen, within } from '@testing-library/react'

import {
  closeOrderUpdatedDialog,
  confirmSlot,
  editOrderFromProductSection,
  fillPhone,
  goToEditOrder,
  openOrderLines,
  saveContactInfo,
  selectLastEditMessage,
  selectSlot,
  showPriceDetail,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cartWithOneUnpublishedProduct } from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { orderCartWithValidPrice } from 'app/order/__scenarios__/orderCart'
import {
  completedPreparedLines,
  order,
  orderDisruptedPayment,
  orderWithIgic,
  orderWithIpsi,
  orderWithSlotBonus,
  preparedLines,
  preparedLinesPriceChanged,
  preparedLinesWithUnpublishedProduct,
} from 'app/order/__scenarios__/orderDetail'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  payments,
  withoutPaymentMethods,
} from 'app/payment/__scenarios__/payments'
import {
  clickToAddNewPaymentMethod,
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
} from 'pages/__tests__/helper'
import {
  clickToModifyDelivery,
  clickToModifyPhone,
} from 'pages/__tests__/helpers/checkout'
import { findPaymentMethodSection } from 'pages/__tests__/helpers/payment'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses = [
    {
      path: `/customers/1/orders/44051/`,
      responseBody: order,
    },
    {
      path: `/customers/1/orders/44051/lines/prepared/`,
      responseBody: preparedLines,
    },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the last edit message', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          last_edit_message: 'Pedido editado hace 1 hora.',
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/customers/1/payment-cards/` },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')
    selectLastEditMessage('Pedido editado hace 1 hora.')

    expect(screen.getByText('Pedido editado hace 1 hora.')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'last_purchase_edition_click',
    )
  })

  it('should be able to show the products in an order', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('1 product')
    openOrderLines()

    const product = screen.getByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(product).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_details_see_products_click',
      {
        order_status: 'Confirmed',
      },
    )
  })

  it('should display product price', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('1 product')
    openOrderLines()

    const product = screen.getByTestId('order-product-cell')
    expect(product).toHaveTextContent('4,25 €')
  })

  it('should display the products prepared price for prepared orders', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: completedPreparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('1 product')
    openOrderLines()

    const product = screen.getByTestId('order-product-cell')
    expect(product).toHaveTextContent('4,00 €')
  })

  it('should display original product price when it has changed', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLinesPriceChanged,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('1 product')
    openOrderLines()

    const product = screen.getByTestId('order-product-cell')
    expect(product).toHaveTextContent('7,50 €')
  })

  it('should be able to show the products in an order with a disrupted payment', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: orderDisruptedPayment,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/payment-cards/`,
        responseBody: payments,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('1 product')
    openOrderLines()

    const product = screen.getByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(product).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_details_see_products_click',
      {
        order_status: 'Payment issue',
      },
    )
  })

  it('should set the order detail view metric', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('ORDER STATUS')

    expect(screen.getByText('ORDER STATUS')).toBeInTheDocument()
    expect(screen.getByText('SUMMARY')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('purchase_view', {
      purchase_id: 44051,
      status: 'confirmed',
    })
  })

  it('should send metric when go to edit order', async () => {
    const responses = [
      ...defaultResponses,
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetail,
      },
      {
        path: `/customers/1/orders/44051/cart/`,
        responseBody: orderCartWithValidPrice,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByLabelText('Modify order')
    goToEditOrder()
    await screen.findByText('Categories')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'edit_purchase_products_click',
      {
        purchase_id: '44051',
        source: 'purchase',
      },
    )
  })

  it('should send metric when go to edit order from order products section', async () => {
    const responses = [
      ...defaultResponses,
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/',
        responseBody: categoryDetail,
      },
      {
        path: `/customers/1/orders/44051/cart/`,
        responseBody: orderCartWithValidPrice,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    editOrderFromProductSection()
    await screen.findByText('Categories')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'edit_purchase_products_click',
      {
        purchase_id: `44051`,
        source: 'purchase',
      },
    )
  })

  it('should allow to edit order contact info', async () => {
    const newPhoneNumber = '666777888'
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          multipleResponses: [
            {
              responseBody: order,
            },
            {
              responseBody: {
                ...order,
                phone_country_code: '34',
                phone_national_number: newPhoneNumber,
              },
            },
          ],
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: `/customers/1/orders/44051/phone-number/`,
          method: 'put',
          requestBody: {
            phone_country_code: '34',
            phone_national_number: newPhoneNumber,
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    await clickToModifyPhone()
    fillPhone(newPhoneNumber)
    saveContactInfo()
    await screen.findByText('+34 666 77 78 88')

    expect(screen.getByText('+34 666 77 78 88')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('telephone')
  })

  it('should not allow to edit order contact info when phone is invalid', async () => {
    const invalidPhoneNumber = '66677788'
    const responses = [
      ...defaultResponses,
      {
        path: `/customers/1/orders/44051/phone-number/`,
        method: 'put',
        requestBody: {
          phone_country_code: '34',
          phone_national_number: invalidPhoneNumber,
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    await clickToModifyPhone()
    fillPhone(invalidPhoneNumber)

    const contactCard = screen.getByLabelText('Phone')
    const saveButton = within(contactCard).getByRole('button', {
      name: 'Save',
    })
    expect(saveButton).toBeDisabled()
  })

  it('should allow to edit order slot if it is not available for a order without slot', async () => {
    const { resetMockDate, slots } = mockDate()
    const [selectedSlot] = slots.results
    const defaultResponses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          slot: selectedSlot,
          start_date: selectedSlot.start,
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    const responses = [
      ...defaultResponses,
      {
        path: `/customers/1/addresses/9695/slots/?size=1&lang=es&wh=vlc1`,
        multipleResponses: [{ responseBody: slots }, { responseBody: slots }],
      },
      {
        path: `/customers/1/orders/44051/delivery-info/`,
        requestBody: { address: order.address, slot: selectedSlot },
        method: 'put',
        status: 400,
        responseBody: {
          errors: [
            {
              detail:
                'El horario seleccionado no está disponible. Inténtalo de nuevo',
              code: 'slot_taken',
            },
          ],
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText('Pick a day for 46013')
    selectSlot('From 11:00 to 12:00')
    confirmSlot()
    await screen.findByRole('dialog')

    const selectedSlotButton = screen.getByRole('button', {
      name: 'From 11:00 to 12:00',
    })
    expect(selectedSlotButton).toHaveClass('slots-item')
    expect(selectedSlotButton).not.toHaveClass('slots-item--selected')

    resetMockDate()
  })

  it('should allow to edit order slot and show the info change modal', async () => {
    const { resetMockDate, slots } = mockDate()
    const [selectedSlot, clickedSlot] = slots.results

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          multipleResponses: [
            {
              responseBody: {
                ...order,
                slot: selectedSlot,
                start_date: selectedSlot.start,
              },
            },
            {
              responseBody: {
                ...order,
                slot: clickedSlot,
              },
            },
          ],
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/1/addresses/9695/slots/?size=1&lang=es&wh=vlc1`,
          responseBody: slots,
        },
        {
          path: `/customers/1/orders/44051/delivery-info/`,
          requestBody: { address: order.address, slot: clickedSlot },
          method: 'put',
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('region', { name: 'Delivery' })
    expect(screen.getByText('from 11:00 to 12:00')).toBeInTheDocument()
    await clickToModifyDelivery()
    await screen.findByText('Pick a day for 46013')
    selectSlot('From 12:00 to 13:00')
    confirmSlot()

    const orderUpdatedModal = await screen.findByRole('dialog')
    expect(
      within(orderUpdatedModal).getByText('Order updated'),
    ).toBeInTheDocument()

    closeOrderUpdatedDialog()

    await screen.findByRole('region', { name: 'Delivery' })
    expect(await screen.findByText('from 12:00 to 13:00')).toBeInTheDocument()

    resetMockDate()
  })

  it('should show the price detail tooltip', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: order,
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    showPriceDetail()

    expect(
      screen.getByText(
        'For products sold by weight, the amount charged will be adjusted to the quantity served. Charging of the final amount will be made after the preparation of your order.',
      ),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('price_detail_click')
  })

  it('should not change the price of the cart if the product in the order is in the cart and unpublished', async () => {
    const responses = [
      {
        path: '/customers/1/cart/',
        responseBody: cartWithOneUnpublishedProduct,
      },
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLinesWithUnpublishedProduct,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    const cartButton = screen.getByLabelText('Show cart')
    expect(cartButton).toContainElement(within(cartButton).getByText('1'))
    expect(cartButton).toContainElement(within(cartButton).getByText('3,00 €'))
  })

  it('opens the payment form to add a new payment method', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/payment-cards/`,
        responseBody: withoutPaymentMethods,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    await clickToModifyPaymentMethod()
    await clickToAddNewPaymentMethod()

    const dialogAddPaymentMethod = await screen.findByRole('dialog', {
      name: 'Add payment method',
    })

    expect(dialogAddPaymentMethod).toBeInTheDocument()
  })

  it('should show crossed slot bonus text', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...orderWithSlotBonus,
          last_edit_message: 'Pedido editado hace 1 hora.',
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/customers/1/payment-cards/` },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    const slotBonus = await screen.findByText('7,21 €')
    expect(slotBonus).toHaveClass('free-delivery__subtotals-bonus')
  })

  it('should show bonus delivery subtitle', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...orderWithSlotBonus,
          last_edit_message: 'Pedido editado hace 1 hora.',
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/customers/1/payment-cards/` },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(
      'Free preparation as compensation for your last order.',
    )

    expect(
      await screen.findByText(
        'Free preparation as compensation for your last order.',
      ),
    ).toBeInTheDocument()
  })

  it('should show ipsi text when tax type is ipsi', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...orderWithIpsi,
          last_edit_message: 'Pedido editado hace 1 hora.',
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/customers/1/payment-cards/` },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    const ipsi = await screen.findByText('IPSI included')

    expect(ipsi).toBeInTheDocument()
  })

  it('should show igic text when tax type is igic', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...orderWithIgic,
          last_edit_message: 'Pedido editado hace 1 hora.',
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: `/customers/1/payment-cards/` },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    const igic = await screen.findByText('IGIC included')

    expect(igic).toBeInTheDocument()
  })

  it('should not start payment incident status polling when order does not have a payment incident', async () => {
    const responses = [
      {
        path: '/customers/1/orders/44051/',
        responseBody: OrderMother.confirmed(),
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/payment-cards/`,
        responseBody: withoutPaymentMethods,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    expect(
      '/customers/1/orders/44051/payment-incident/status/',
    ).not.toHaveBeenFetched()
  })

  describe('when the user deletes their payment method and they want to edit the payment method of an order', () => {
    it('displays the payment method of the order on the list of payment methods', async () => {
      const responses = [
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/1/payment-cards/`,
          responseBody: withoutPaymentMethods,
        },
      ]
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const paymentSection = await findPaymentMethodSection()

      await clickToModifyPaymentMethod()

      expect(
        await within(paymentSection).findByRole('radio', {
          name: 'Visa, **** 6017, Expires 01/23',
        }),
      ).toBeInTheDocument()
    })

    it('does not display the same payment method twice', async () => {
      const responses = [
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/1/payment-cards/`,
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
      ]
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const paymentSection = await findPaymentMethodSection()

      await clickToModifyPaymentMethod()

      expect(
        await within(paymentSection).findAllByRole('radio', {
          name: 'Visa, **** 6017, Expires 01/23',
        }),
      ).toHaveLength(1)
    })

    it('does not make a PUT request to the API if the payment method did not change', async () => {
      const responses = [
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/1/payment-cards/`,
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
      ]
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      await clickToModifyPaymentMethod()
      await clickToSavePaymentMethod()

      expect(
        '/customers/1/orders/44051/payment-method/',
      ).not.toHaveBeenFetchedWith({
        method: 'PUT',
        requestBody: { payment_method: { id: 4720 } },
      })
    })
  })
})

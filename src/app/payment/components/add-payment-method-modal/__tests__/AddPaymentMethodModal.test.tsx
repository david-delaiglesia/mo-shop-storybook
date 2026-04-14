import { cleanup, render } from '@testing-library/react'

import { AddPaymentMethodModal, AddPaymentMethodModalCustomMode } from '../'
import { wrapper } from 'testUtils'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { Order } from 'app/order'
import * as UseOrderContextModule from 'app/order/contexts/OrderContext'
import { OrderContextState } from 'app/order/contexts/OrderContext/OrderContext'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { PaymentClient } from 'app/payment/client'
import * as PaymentHooksModule from 'app/payment/hooks'
import {
  clickToSavePaymentMethod,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('AddPaymentMethodModal', () => {
  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('should send metrics when selecting a payment method type bizum', async () => {
    render(
      wrapper(
        <AddPaymentMethodModal
          onAddNewPaymentMethod={vi.fn()}
          onError={vi.fn()}
          onClose={vi.fn()}
        />,
      ),
    )

    await selectNewPaymentMethodBizum()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'select_payment_method_type_click',
      {
        payment_method_type: 'bizum',
        order_id: undefined,
      },
    )
  })

  it('should send metrics when selecting a payment method type card', async () => {
    vi.spyOn(PaymentClient, 'getIframe').mockImplementation(async () =>
      PaymentAuthenticationMother.redsysCard(),
    )

    render(
      wrapper(
        <AddPaymentMethodModal
          onAddNewPaymentMethod={vi.fn()}
          onError={vi.fn()}
          onClose={vi.fn()}
        />,
      ),
    )

    await selectNewPaymentMethodCard()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'select_payment_method_type_click',
      {
        payment_method_type: 'card',
        order_id: undefined,
      },
    )
  })

  it('should send metrics when selecting a payment method type bizum with order', async () => {
    vi.spyOn(UseOrderContextModule, 'useOrderContext').mockReturnValue({
      order: { id: 123 } as Partial<Order>,
      isLoading: false,
      refetchOrder: vi.fn(),
    } as OrderContextState)

    render(
      wrapper(
        <AddPaymentMethodModal
          onAddNewPaymentMethod={vi.fn()}
          onError={vi.fn()}
          onClose={vi.fn()}
        />,
      ),
    )

    await selectNewPaymentMethodBizum()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'select_payment_method_type_click',
      {
        payment_method_type: 'bizum',
        order_id: 123,
      },
    )
  })

  it('should send metrics when selecting an existent payment method', async () => {
    vi.spyOn(PaymentHooksModule, 'useUserPaymentMethods').mockReturnValue({
      isLoading: false,
      paymentMethods: [snakeCaseToCamelCase(PaymentMethodMother.bizum())],
      defaultPaymentMethod: snakeCaseToCamelCase(PaymentMethodMother.bizum()),
      nonDefaultPaymentMethods: [],
      refetch: vi.fn(),
    })

    const spyOnChangePaymentMethod = vi.fn()

    render(
      wrapper(
        <AddPaymentMethodModal
          initialMode={AddPaymentMethodModalCustomMode.CURRENT_PAYMENT_METHODS}
          onChangePaymentMethod={spyOnChangePaymentMethod}
          onAddNewPaymentMethod={vi.fn()}
          onError={vi.fn()}
          onClose={vi.fn()}
        />,
      ),
    )

    await selectExistentPaymentMethod('Bizum, +34 700000000, Bizum')
    await clickToSavePaymentMethod()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'select_payment_method_click',
      {
        order_id: 123,
        payment_method_id: PaymentMethodMother.bizum().id,
        payment_method: '+34 700000000',
      },
    )
  })
})

import { PaymentTPV } from '../PaymentTPV'

import { SystemAlert } from 'services/system-alert'

describe('PaymentTPV', () => {
  describe('autoRedirectToPaymentAuth', () => {
    it('should create and submit a form to auto redirect to payment auth', () => {
      vi.spyOn(SystemAlert, 'deactivate')

      // Test implementation
      PaymentTPV.autoRedirectToPaymentAuth({
        URL_Base: 'http://tvp-baseurl',
        Ds_SignatureVersion: '1.0',
        Ds_MerchantParameters: 'ds_merchant_parameters',
        Ds_Signature: 'ds_signature',
        UnknownParam: 'unknown_value',
      })

      expect(SystemAlert.deactivate).toHaveBeenCalled()
      expect(document.body).toMatchInlineSnapshot(`
        <body>
          <form
            action="http://tvp-baseurl"
            method="POST"
            novalidate=""
            target="_self"
          >
            <input
              name="Ds_SignatureVersion"
              type="hidden"
              value="1.0"
            />
            <input
              name="Ds_MerchantParameters"
              type="hidden"
              value="ds_merchant_parameters"
            />
            <input
              name="Ds_Signature"
              type="hidden"
              value="ds_signature"
            />
            <input
              name="UnknownParam"
              type="hidden"
              value="unknown_value"
            />
          </form>
        </body>
      `)
    })
  })
})

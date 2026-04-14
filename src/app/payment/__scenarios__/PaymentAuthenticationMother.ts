import {
  PaymentAuthenticationResponse,
  PaymentMethodType,
  PaymentProvider,
} from '../interfaces'

export const PaymentAuthenticationMother = {
  redsysCard(): PaymentAuthenticationResponse {
    return {
      authentication_uuid: 'pa_redsys_card_uuid',
      provider: PaymentProvider.REDSYS,
      payment_method_type: PaymentMethodType.CREDIT_CARD,
      params: {
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: 'eyJEc19NZXJjaGFudF9DdXJyZW5=',
        Ds_Signature: '3cwHlDXMIYbkWTvmq1SJWwZUjZvoj/VqFlbezHR5gTA=',
        URL_Base: 'https://sis-i.redsys.es:25443/sis/realizarPago',
      },
    }
  },
  redsysBizum(): PaymentAuthenticationResponse {
    return {
      authentication_uuid: 'pa_redsys_bizum_uuid',
      provider: PaymentProvider.REDSYS,
      payment_method_type: PaymentMethodType.BIZUM,
      params: {
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: 'eyJEc19NZXJjaGFudF9DdXJyZW5=',
        Ds_Signature: '3cwHlDXMIYbkWTvmq1SJWwZUjZvoj/VqFlbezHR5gTA=',
        URL_Base: 'https://sis-i.redsys.es:25443/sis/realizarPago',
      },
    }
  },
  cecaCard(): PaymentAuthenticationResponse {
    return {
      authentication_uuid: 'pa_ceca_card_uuid',
      provider: PaymentProvider.CECA,
      payment_method_type: PaymentMethodType.CREDIT_CARD,
      params: {
        Ds_SignatureVersion: 'HMAC_SHA256_V1',
        Ds_MerchantParameters: 'eyJEc19NZXJjaGFudF9DdXJyZW5=',
        Ds_Signature: '3cwHlDXMIYbkWTvmq1SJWwZUjZvoj/VqFlbezHR5gTA=',
        URL_Base: 'https://sis-i.redsys.es:25443/sis/realizarPago',
      },
    }
  },
}

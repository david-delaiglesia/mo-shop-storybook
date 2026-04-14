import { useLocation } from 'react-router'

import { bool, func, object, shape, string } from 'prop-types'

import { compose } from '@mercadona/mo.library.dashtil'

import { MOBILE_APP_STORE_URL } from 'app/catalog/constants'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { ButtonWithFeedback } from 'components/button'
import { MarketLinks } from 'components/market-links'
import { MOBILE_OS, MobileDetector } from 'libs/mobile-detector'
import Input from 'system-ui/input'
import { TAB_INDEX } from 'utils/constants'

import './styles/CompactZipChecker.css'

const CompactZipChecker = ({
  appNotFound,
  form,
  onSave,
  onChange,
  onKeyPress,
  onClickMetrics,
  t,
  product,
}) => {
  const { search } = useLocation()

  const openMercadonaApp = () => {
    const searchParams = new URLSearchParams(search)
    const campaignId = searchParams.get('campaign')

    const os = MobileDetector.getMobileOperatingSystem()

    if (os === MOBILE_OS.ANDROID) {
      window.location = `intent://tienda.mercadona.es/product/${product.id}/?campaign=${campaignId}#Intent;scheme=mercadona;package=es.mercadona.tienda;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Des.mercadona.tienda%26referrer%3Dproduct%2F${product.id}%2F%3Fcampaign%3D${campaignId};end;`
    }
    if (os === MOBILE_OS.IOS) {
      const appStoreURL = MOBILE_APP_STORE_URL[MOBILE_OS.IOS]
      const deepLinkURL = `mercadona://tienda.mercadona.es/product/${product.id}?campaign=${campaignId}`

      setTimeout(function () {
        if (document.hasFocus()) {
          window.location = appStoreURL
        }
      }, 3000)

      window.location = deepLinkURL
    }

    onClickMetrics()
  }

  return (
    <div className="compact-zip-checker">
      <p className="compact-zip-checker__title" tabIndex={TAB_INDEX.ENABLED}>
        {t('product_postal_code_title')}
      </p>
      <p
        className="compact-zip-checker__subtitle compact-zip-checker__subtitle--desktop"
        tabIndex={TAB_INDEX.ENABLED}
      >
        {t('product_postal_code_subtitle')}
      </p>
      <p
        className="compact-zip-checker__subtitle compact-zip-checker__subtitle--mobile"
        tabIndex={TAB_INDEX.ENABLED}
      >
        {t('product_postal_code_subtitle_responsive')}
      </p>
      {appNotFound ? (
        <MarketLinks className="compact-zip-checker__store-links" />
      ) : (
        <a
          className="button button-primary button-big compact-zip-checker__button-mobile"
          onClick={openMercadonaApp}
          rel="noopener noreferrer"
          target="_blank"
          data-testid="open-in-app"
        >
          <span className="button__text">
            {' '}
            {t('product_postal_code_button_responsive')}{' '}
          </span>
          <i className="icon icon-forward-28" data-testid="icon" />
        </a>
      )}
      <form className="compact-zip-checker__form" onKeyPress={onKeyPress}>
        <Input
          name="postalCode"
          label="input.postal_code"
          size="default"
          value={form.fields.postalCode.value}
          validation={form.fields.postalCode.validation}
          onChange={onChange}
          maxLength={5}
          tabIndex={TAB_INDEX.ENABLED}
        />
        <ButtonWithFeedback
          onClick={onSave}
          text="product_postal_code_button"
          size="big"
          icon="forward-28"
          isAsync={form.isValid}
          tabIndex={TAB_INDEX.ENABLED}
        />
      </form>
    </div>
  )
}

CompactZipChecker.propTypes = {
  product: object.isRequired,
  appNotFound: bool.isRequired,
  form: shape({
    fields: shape({
      postalCode: shape({
        value: string,
        validation: shape({
          message: string,
          type: string.isRequired,
          isDirty: bool.isRequired,
        }).isRequired,
        getValidation: func.isRequired,
      }).isRequired,
    }).isRequired,
    isValid: bool.isRequired,
  }).isRequired,
  onSave: func.isRequired,
  onKeyPress: func.isRequired,
  onChange: func.isRequired,
  onClickMetrics: func.isRequired,
  t: func.isRequired,
}

const ComposedCompactZipChecker = compose(withTranslate)(CompactZipChecker)

export { ComposedCompactZipChecker as CompactZipChecker }

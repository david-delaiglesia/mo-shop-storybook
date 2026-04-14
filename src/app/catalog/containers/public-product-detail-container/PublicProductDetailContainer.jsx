import { Component, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import { PublicProductDetailMetrics } from './PublicProductDetailMetrics'
import { func, shape, string } from 'prop-types'

import { compose, createThunk } from '@mercadona/mo.library.dashtil'

import { updatePostalCode } from 'app/authentication/commands'
import { PublicProductDetail } from 'app/catalog/components/public-product-detail'
import {
  APP_NOT_FOUND_QUERY_STRING,
  MOBILE_APP_STORE_URL,
} from 'app/catalog/constants'
import { DeliveryAreaClient } from 'app/delivery-area/client'
import { UnavailableAreaContainer } from 'app/delivery-area/containers/unavailable-area-container'
import { withTranslate } from 'app/i18n/containers/i18n-provider'
import { MOBILE_OS, MobileDetector } from 'libs/mobile-detector'
import {
  getDefaultValidation,
  getPostalCodeValidation,
  getUpdatedFormValidation,
  validateForm,
} from 'utils/input-validators'
import { clearPendingAction } from 'wrappers/feedback/actions'
import { withInteractionMetrics } from 'wrappers/metrics'

const PublicProductDetailWithMetrics = withInteractionMetrics(
  PublicProductDetailMetrics,
)(PublicProductDetail)

const isQueryStringParamEnabled = (location) =>
  location.search.includes(APP_NOT_FOUND_QUERY_STRING)

const goToStore = (mobileOS) =>
  (window.location.href = MOBILE_APP_STORE_URL[mobileOS])

class PublicProductDetailContainer extends Component {
  state = {
    form: {
      fields: {
        postalCode: {
          value: undefined,
          validation: getDefaultValidation(),
          getValidation: getPostalCodeValidation,
        },
      },
      isValid: false,
    },
    isUnavailableAreaVisible: false,
    showOpenGenericStore: false,
  }

  componentDidMount() {
    const { location } = this.props

    if (!isQueryStringParamEnabled(location)) return

    const OS = MobileDetector.getMobileOperatingSystem()

    if (OS === MOBILE_OS.GENERIC) {
      this.setState({ showOpenGenericStore: true })
      return
    }

    goToStore(OS)
  }

  goToUnavailableArea() {
    this.setState({ isUnavailableAreaVisible: true })
  }

  validatePostalCode = async (postalCode) => {
    try {
      await DeliveryAreaClient.anonymousUpdate(postalCode)
      this.props.updatePostalCode(postalCode)
    } catch {
      this.goToUnavailableArea()
    } finally {
      this.props.clearPendingAction()
    }
  }

  onSave = () => {
    const { isValid, fields } = validateForm(this.state.form)

    if (!isValid) {
      this.setState({ form: { isValid, fields } })
      return
    }

    this.validatePostalCode(fields.postalCode.value)
  }

  onEnterKeyPress = (event) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    event.target.blur()
    this.onSave()
  }

  onChange = (event) => {
    const { name, value } = event.target

    this.setState({
      form: getUpdatedFormValidation(this.state.form, name, value),
      isUnavailableAreaVisible: false,
    })
  }

  closeUnavailableArea = () => {
    this.setState({ isUnavailableAreaVisible: false })
  }

  render() {
    const { product, location, t } = this.props
    const { form, isUnavailableAreaVisible, showOpenGenericStore } = this.state

    const appNotFound = isQueryStringParamEnabled(location)

    if (appNotFound && !showOpenGenericStore) {
      return null
    }

    return (
      <Fragment>
        <Helmet>
          <meta property="og:url" content={window.location.href} />
          <meta property="og:image" content={product.photos[0]?.regular} />
          <meta
            property="og:title"
            content={`${product.display_name} | ${
              import.meta.env.VITE_WEBSITE_NAME
            }`}
          />
          <meta
            property="og:description"
            content={t('sharing_preview_description')}
          />
          <title>{`${product.display_name} | ${
            import.meta.env.VITE_WEBSITE_NAME
          }`}</title>
          <meta name="description" content={t('sharing_preview_description')} />
        </Helmet>
        <PublicProductDetailWithMetrics
          product={product}
          appNotFound={appNotFound}
          form={form}
          onSave={this.onSave}
          onKeyPress={this.onEnterKeyPress}
          onChange={this.onChange}
        />

        {isUnavailableAreaVisible && (
          <UnavailableAreaContainer
            postalCode={form.fields.postalCode.value}
            enterAnotherPostalCode={this.closeUnavailableArea}
          />
        )}
      </Fragment>
    )
  }
}

PublicProductDetailContainer.propTypes = {
  product: shape({
    display_name: string.isRequired,
  }).isRequired,
  clearPendingAction: func.isRequired,
  updatePostalCode: func.isRequired,
  location: shape({
    search: string,
  }).isRequired,
  t: func.isRequired,
}

const mapDispatchToProps = {
  clearPendingAction,
  updatePostalCode: createThunk(updatePostalCode),
}

const ComposedPublicProductDetailContainer = compose(
  withTranslate,
  withRouter,
  connect(null, mapDispatchToProps),
)(PublicProductDetailContainer)

export { ComposedPublicProductDetailContainer as PublicProductDetailContainer }

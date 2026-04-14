import { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { UnavailableAreaContainer } from '../unavailable-area-container'
import { OnboardingContainerMetrics } from './OnboardingContainerMetrics'
import { bool, func, node, shape, string } from 'prop-types'
import { compose } from 'redux'

import { createThunk } from '@mercadona/mo.library.dashtil'

import { updatePostalCode } from 'app/authentication/commands'
import { DeliveryAreaClient } from 'app/delivery-area/client'
import { PostalCodeChecker } from 'app/delivery-area/components/postal-code-checker'
import {
  ONBOARDING_URLS,
  PATHS_WITHOUT_POSTAL_CODE,
} from 'app/delivery-area/constants'
import { PATHS } from 'pages/paths'
import { comparePath } from 'pages/routing'
import { Session } from 'services/session'
import {
  getDefaultValidation,
  getPostalCodeValidation,
  getUpdatedFormValidation,
  resetForm,
  validateForm,
} from 'utils/input-validators'
import { withInteractionMetrics } from 'wrappers/metrics'

const PostalCodeCheckerWithMetrics = withInteractionMetrics(
  OnboardingContainerMetrics,
)(PostalCodeChecker)

class OnboardingContainer extends Component {
  state = {
    isPostalCodeCheckerVisible: true,
    isUnavailableAreaVisible: false,
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
  }

  onSave = async () => {
    const { isValid, fields } = validateForm(this.state.form)

    if (!isValid) {
      this.setState({ form: { isValid, fields } })
      return
    }

    await this.validatePostalCode(fields.postalCode.value)
  }

  goToPostalCodeChecker = () => {
    const { form } = this.state

    this.setState({
      isPostalCodeCheckerVisible: true,
      isUnavailableAreaVisible: false,
      form: resetForm(form),
    })
  }

  closePostalCodeChecker() {
    this.setState({ isPostalCodeCheckerVisible: false })
  }

  onSaveSuccess(postalCode) {
    this.props.updatePostalCode(postalCode)
    this.closePostalCodeChecker()
  }

  goToUnavailableArea() {
    this.setState({
      isPostalCodeCheckerVisible: false,
      isUnavailableAreaVisible: true,
    })
  }

  validatePostalCode = async (postalCode) => {
    try {
      await DeliveryAreaClient.anonymousUpdate(postalCode)
      this.onSaveSuccess(postalCode)
    } catch {
      this.goToUnavailableArea()
    }
  }

  onChange = (event) => {
    const { name, value } = event.target

    this.setState({
      form: getUpdatedFormValidation(this.state.form, name, value),
      isUnavailableAreaVisible: false,
    })
  }

  hasPostalCodeAlready = () => {
    const { session } = this.props
    const { postalCode } = Session.get()
    return !!postalCode || session.isAuth
  }

  willCheckPostalCode() {
    return !PATHS_WITHOUT_POSTAL_CODE.some((path) =>
      comparePath(this.props.location.pathname, path),
    )
  }

  willShowOnboarding() {
    return ONBOARDING_URLS.some((path) =>
      comparePath(this.props.location.pathname, path),
    )
  }

  render() {
    if (!this.willCheckPostalCode()) {
      return this.props.children
    }
    if (this.hasPostalCodeAlready()) {
      return this.props.children
    }
    if (!this.willShowOnboarding()) {
      this.props.history.push(PATHS.HOME)
      return null
    }

    const { form, isPostalCodeCheckerVisible, isUnavailableAreaVisible } =
      this.state

    return (
      <Fragment>
        {this.props.children}
        {isPostalCodeCheckerVisible && (
          <PostalCodeCheckerWithMetrics
            onSave={this.onSave}
            onEnterKeyPress={this.onSave}
            onChange={this.onChange}
            form={form}
          />
        )}
        {isUnavailableAreaVisible && (
          <UnavailableAreaContainer
            postalCode={form.fields.postalCode.value}
            enterAnotherPostalCode={this.goToPostalCodeChecker}
          />
        )}
      </Fragment>
    )
  }
}

OnboardingContainer.propTypes = {
  session: shape({
    isAuth: bool.isRequired,
  }).isRequired,
  children: node.isRequired,
  location: shape({
    pathname: string.isRequired,
  }).isRequired,
  updatePostalCode: func.isRequired,
  history: shape({
    push: func.isRequired,
  }).isRequired,
}

const mapStateToProps = ({ session, metrics }) => ({ session, metrics })
const mapDispatchToProps = {
  updatePostalCode: createThunk(updatePostalCode),
}

const composedOnboardingContainer = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(OnboardingContainer)

export { composedOnboardingContainer as OnboardingContainer }

import { Component } from 'react'

import PropTypes from 'prop-types'

import { OrderContact } from 'app/order/components/order-contact'
import {
  sendChangePhoneNumberMetrics,
  sendPhoneNumberSaveClickMetrics,
  sendTelephoneViewMetrics,
} from 'app/order/metrics'
import { NetworkError } from 'services/http'
import { countryCodes } from 'system-ui/input/InputPhone/countryCodes'
import { getUpdatedPhoneFormValidation } from 'utils/input-validators'

const DEFAULT_COUNTRY_CODE = '34'
const EMPTY_PHONE_NUMBER = ''
function findCountryCode(targetCode) {
  return countryCodes.find(
    (countryCode) => countryCode.phoneCountryCode === targetCode,
  )
}

class OrderContactContainer extends Component {
  state = {
    editMode: false,
    form: { isValid: true },
  }

  componentDidMount() {
    const { phoneNationalNumber } = this.props
    if (!phoneNationalNumber) {
      this.activateEditMode()
    }
  }

  activateEditMode = () => {
    const {
      phoneNationalNumber: phoneNumberProps,
      phoneCountryCode: countryCodeProps,
      incrementEditMode,
    } = this.props

    sendTelephoneViewMetrics()

    const phoneCountryCode = countryCodeProps || DEFAULT_COUNTRY_CODE
    const phoneNationalNumber = phoneNumberProps || EMPTY_PHONE_NUMBER
    const selectedCountryCode = findCountryCode(phoneCountryCode)

    this.setState({
      selectedCountryCode,
      editMode: true,
      form: getUpdatedPhoneFormValidation(
        phoneNationalNumber,
        selectedCountryCode.isoCountryCode,
        selectedCountryCode.phoneCountryCode,
      ),
    })

    if (incrementEditMode) {
      incrementEditMode()
    }
  }

  activateEditModeWithMetrics = () => {
    const { checkoutId, orderId, phoneNationalNumber, phoneCountryCode } =
      this.props
    sendChangePhoneNumberMetrics({
      checkoutId: checkoutId,
      orderId: orderId,
      phoneNumber: phoneNationalNumber,
      countryCode: phoneCountryCode,
    })
    this.activateEditMode()
  }

  onChange = (event) => {
    const { value } = event.target
    const { isoCountryCode, phoneCountryCode } = this.state.selectedCountryCode

    this.setState({
      form: getUpdatedPhoneFormValidation(
        value,
        isoCountryCode,
        phoneCountryCode,
      ),
    })
  }

  onSelectCountryCode = (selectedCountryCode) => {
    const { value } = this.state.form.fields.phone

    this.setState({
      selectedCountryCode,
      form: getUpdatedPhoneFormValidation(
        value,
        selectedCountryCode.isoCountryCode,
        selectedCountryCode.phoneCountryCode,
      ),
    })
  }

  save = async () => {
    sendPhoneNumberSaveClickMetrics({
      countryCode: this.state.selectedCountryCode.phoneCountryCode,
      phoneNumber: this.state.form.fields.phone.value,
    })
    try {
      await this.confirmCustomerPhone()
      this.deactivateEditMode()
    } catch (error) {
      NetworkError.publish(error)
    }
  }

  confirmCustomerPhone = async () => {
    const {
      selectedCountryCode,
      form: {
        fields: { phone },
      },
    } = this.state
    const { phoneCountryCode } = selectedCountryCode

    const checkout = {
      phone_country_code: phoneCountryCode,
      phone_national_number: phone.value,
    }
    await this.props.confirmData(checkout)
  }

  deactivateEditMode = () => {
    const { decrementEditMode } = this.props
    this.setState({ editMode: false, form: { isValid: true } })

    if (decrementEditMode) {
      decrementEditMode()
    }
  }

  getContactProps = (
    editing,
    form,
    selectedCountryCode,
    phoneNationalNumber,
    phoneCountryCode,
  ) => {
    if (editing) {
      return { formProp: form, countyCodeProp: selectedCountryCode }
    }

    const countyCodeProp = findCountryCode(
      phoneCountryCode || DEFAULT_COUNTRY_CODE,
    )
    return {
      countyCodeProp,
      formProp: { ...form, fields: { phone: { value: phoneNationalNumber } } },
    }
  }

  render() {
    const {
      phoneNationalNumber,
      phoneCountryCode,
      hidden,
      showEditButton,
      checkoutId,
      orderId,
    } = this.props
    const { form, editMode, selectedCountryCode } = this.state

    const { formProp, countyCodeProp } = this.getContactProps(
      editMode,
      form,
      selectedCountryCode,
      phoneNationalNumber,
      phoneCountryCode,
    )

    return (
      <OrderContact
        form={formProp}
        selectedCountryCode={countyCodeProp}
        isCancellable={!!phoneNationalNumber}
        editMode={editMode}
        activateEditMode={this.activateEditModeWithMetrics}
        onChange={this.onChange}
        onSelectCountryCode={this.onSelectCountryCode}
        save={this.save}
        cancel={this.deactivateEditMode}
        hidden={hidden}
        onEnterKeyPress={this.save}
        showEditButton={showEditButton}
        checkoutId={checkoutId}
        orderId={orderId}
      />
    )
  }
}

OrderContactContainer.propTypes = {
  phoneNationalNumber: PropTypes.string,
  phoneCountryCode: PropTypes.string,
  incrementEditMode: PropTypes.func,
  decrementEditMode: PropTypes.func,
  confirmData: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
  showEditButton: PropTypes.bool.isRequired,
  checkoutId: PropTypes.number.isRequired,
  orderId: PropTypes.number.isRequired,
}

OrderContactContainer.defaultProps = {
  showEditButton: true,
}

export { OrderContactContainer }

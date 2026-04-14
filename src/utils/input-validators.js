import { PhoneUtils } from './phone'
import { containsOnlySpaces, isAsciiPrintable } from './strings'

const VALIDATION_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
}

const REGEXP_TYPES = {
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  POSTAL_CODE: /^0[1-9][0-9]{3}|[1-4][0-9]{4}|5[0-2][0-9]{3}$/,
}

const VALIDATION_TYPES = {
  IS_REQUIRED: {
    message: 'validation_errors.is_required',
    ruleFails: (propertyToValidate) =>
      !propertyToValidate || propertyToValidate.length === 0,
  },
  WRONG_EMAIL_FORMAT: {
    message: 'validation_errors.wrong_email_format',
    ruleFails: (email) => !REGEXP_TYPES.EMAIL.test(email),
  },
  WRONG_POSTAL_CODE_FORMAT: {
    message: 'validation_errors.wrong_pc_format',
    ruleFails: (postalCode) =>
      !REGEXP_TYPES.POSTAL_CODE.test(postalCode) || postalCode.length > 5,
  },
  WRONG_NAME_FORMAT: {
    message: 'validation_errors.wrong_name_format',
    ruleFails: (name) => containsOnlySpaces(name),
  },
  WRONG_PASSWORD_FORMAT: {
    message: 'validation_errors.wrong_password_format',
    ruleFails: (password) => password.length < 6 || !isAsciiPrintable(password),
  },
  WRONG_PHONE_FORMAT: {
    message: 'validation_errors.wrong_phone_format',
    ruleFails: (phone, isoCountryCode, phoneCountryCode) => {
      if (!phone) {
        return true
      }

      try {
        return !PhoneUtils.isValidPhone({
          nationalNumber: phone,
          country: isoCountryCode,
          countryCode: phoneCountryCode,
        })
      } catch {
        return true
      }
    },
  },
}

const buildValidation = (message) => ({
  message,
  type: message ? VALIDATION_STATUS.ERROR : VALIDATION_STATUS.SUCCESS,
  isDirty: true,
})

export const getDefaultValidation = () => ({
  message: undefined,
  type: VALIDATION_STATUS.SUCCESS,
  isDirty: false,
})

export const getPositiveValidation = () => ({
  message: undefined,
  type: VALIDATION_STATUS.SUCCESS,
  isDirty: true,
})

export const getLengthValidation = (propertyToValidate) => {
  const { ruleFails, message } = VALIDATION_TYPES.IS_REQUIRED
  if (ruleFails(propertyToValidate)) {
    return buildValidation(message)
  }
  return buildValidation()
}

export const getEmailValidation = (email) =>
  withLengthValidation(email, VALIDATION_TYPES.WRONG_EMAIL_FORMAT)

export const getPostalCodeValidation = (postalCode) =>
  withLengthValidation(postalCode, VALIDATION_TYPES.WRONG_POSTAL_CODE_FORMAT)

export const getNameValidation = (name) =>
  withLengthValidation(name, VALIDATION_TYPES.WRONG_NAME_FORMAT)

export const getPasswordValidation = (password) =>
  withLengthValidation(password, VALIDATION_TYPES.WRONG_PASSWORD_FORMAT)

export const getPhoneValidation = (phone) =>
  withLengthValidation(phone, VALIDATION_TYPES.WRONG_PHONE_FORMAT)

const withLengthValidation = (propertyToValidate, wrappedValidation) => {
  const lengthValidation = getLengthValidation(propertyToValidate)
  if (!isValid(lengthValidation)) {
    return lengthValidation
  }

  const { ruleFails, message } = wrappedValidation
  if (ruleFails(propertyToValidate)) {
    return buildValidation(message)
  }

  return buildValidation()
}

export const getUpdatedPhoneFormValidation = (
  phoneNumber,
  isoCountryCode,
  phoneCountryCode,
) => {
  const { ruleFails, message } = VALIDATION_TYPES.WRONG_PHONE_FORMAT

  let getValidation = buildValidation()

  if (ruleFails(phoneNumber, isoCountryCode, phoneCountryCode)) {
    getValidation = buildValidation(message)
  }

  const fields = {
    phone: {
      value: phoneNumber,
      validation: getValidation,
    },
  }
  const isValid = isValidForm(fields)

  return { fields, isValid }
}

export const getUpdatedFormValidation = (form, fieldName, fieldValue) => {
  const { getValidation } = form.fields[fieldName]
  const fields = {
    ...form.fields,
    [fieldName]: {
      value: fieldValue,
      validation: getValidation(fieldValue),
      getValidation,
    },
  }
  const isValid = isValidForm(fields)

  return { fields, isValid }
}

function validateByField(form, currentFieldName) {
  const fieldValue = form.fields[currentFieldName].value

  const { fields, isValid } = getUpdatedFormValidation(
    form,
    currentFieldName,
    fieldValue,
  )
  const validatedFieldsSoFar = {
    ...form.fields,
    ...fields,
  }

  return {
    fields: validatedFieldsSoFar,
    isValid,
  }
}

export function validateForm(form) {
  const formFields = Object.keys(form.fields)
  return formFields.reduce(validateByField, form)
}

function resetByField(form, currentFieldName) {
  const { getValidation } = form.fields[currentFieldName]

  const fields = {
    ...form.fields,
    [currentFieldName]: {
      getValvalue: undefined,
      validation: getDefaultValidation(),
      getValidation,
    },
  }

  return {
    fields,
    isValid: false,
  }
}

export function resetForm(form) {
  const formFields = Object.keys(form.fields)
  return formFields.reduce(resetByField, form)
}

const isValidForm = (fields) => {
  const fieldsList = Object.values(fields)
  const fieldsHaveProperValue = fieldsList.every(hasProperValue)
  return (
    fieldsHaveProperValue ||
    fieldsList.every((field) => isValid(field.validation))
  )
}

const hasProperValue = ({ value, validation }) =>
  value && validation.type === VALIDATION_STATUS.SUCCESS
const isValid = ({ isDirty, type }) =>
  isDirty && type === VALIDATION_STATUS.SUCCESS

export function focusNextInput(event, nextElement, maxLength) {
  if (event.target.value.length === maxLength) {
    nextElement.focus()
  }
}

export function hasAllRequiredFields(requiredFields) {
  for (let property in requiredFields) {
    if (!requiredFields[property]) {
      return false
    }
  }
  return true
}

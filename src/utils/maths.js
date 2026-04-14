export const roundInt = (number, positions) =>
  parseFloat(number).toFixed(positions)

export const getLocalePrize = (price) =>
  parseFloat(price).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export const getLocaleStringValue = (value, minDigits = 2, maxDigits = 2) =>
  parseFloat(value).toLocaleString('es-ES', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  })

export const clampValues = (val, min, max) => {
  if (val < min) {
    return min
  }
  if (val > max) {
    return max
  }
  return val
}

export const isValueBetweenRange = (val, min, max) => {
  return val >= min && val <= max
}

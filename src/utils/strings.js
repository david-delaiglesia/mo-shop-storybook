export function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1)
}

export function capitalizeString(string) {
  return string.toUpperCase()
}

export const containsSpecificWord = (string, word) => {
  if (!word || word.length === 0) {
    return false
  }

  return string.toLowerCase().includes(word)
}

export const containsLetters = (string) => /[a-z]+/.test(string.toLowerCase())

export const containsNumbers = (string) => /[0-9]+/.test(string)

export const onlyContainsNumbers = (string) => /^\d+$/.test(string)

export const containsSymbols = (string) =>
  /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(string)

export const containsUpperCase = (string) => /[A-Z]+/.test(string)

export const containsOnlySpaces = (string) => string.trim().length === 0

export const clearLastWhiteSpaces = (string) => string.trim()

export const haveSpecificLength = (string, length) => string.length === length

export const isAsciiPrintable = (string) => {
  const lettersInString = Array.from(string)
  const isAsciiPrintable = lettersInString.every(isAsciiPrintableLetter)

  return isAsciiPrintable
}

const isAsciiPrintableLetter = (letter) => {
  const asciiCode = letter.charCodeAt()
  const MIN_ASCII_CODE_PRINTABLE = 33
  const MAX_ASCII_CODE_PRINTABLE = 126

  return (
    asciiCode >= MIN_ASCII_CODE_PRINTABLE &&
    asciiCode <= MAX_ASCII_CODE_PRINTABLE
  )
}

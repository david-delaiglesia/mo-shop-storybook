import { DropdownOption } from './Dropdown'

export const findNextEnabledIndex = (
  options: DropdownOption[],
  startIndex: number,
): number => {
  let index = startIndex
  let attempts = 0
  const maxAttempts = options.length

  while (attempts < maxAttempts) {
    index = index < options.length - 1 ? index + 1 : 0
    if (!options[index].disabled) {
      return index
    }
    attempts++
  }
  return startIndex
}

export const findPrevEnabledIndex = (
  options: DropdownOption[],
  startIndex: number,
): number => {
  let index = startIndex
  let attempts = 0
  const maxAttempts = options.length

  while (attempts < maxAttempts) {
    index = index > 0 ? index - 1 : options.length - 1
    if (!options[index].disabled) {
      return index
    }
    attempts++
  }
  return startIndex
}

export const findFirstEnabledIndex = (options: DropdownOption[]): number => {
  return options.findIndex((option) => !option.disabled)
}

export const findLastEnabledIndex = (options: DropdownOption[]): number => {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i].disabled) {
      return i
    }
  }
  return -1
}

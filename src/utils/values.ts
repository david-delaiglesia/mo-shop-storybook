export const isNull = (value: unknown): value is null => value === null

export const isNullish = (value: unknown): value is null | undefined =>
  value == null || value === undefined

export const isEmpty = (value: unknown): value is '' | null => {
  return value === '' || value === null
}

export function compareSimpleObjects(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const isEmptyObject = (obj) => Object.keys(obj).length === 0

export const cloneDeep = (originalObject) =>
  JSON.parse(JSON.stringify(originalObject))

export const encodeObjectValues = (obj) => {
  const encodedObj = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      encodedObj[key] = encodeURIComponent(obj[key])
    }
  }
  return encodedObj
}

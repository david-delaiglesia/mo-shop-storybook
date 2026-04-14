export const actionTypes = {
  SET_HEADER_TYPE: 'HEADER_TYPE/SET',
}

export function setHeaderType(headerType) {
  return {
    type: actionTypes.SET_HEADER_TYPE,
    payload: headerType,
  }
}

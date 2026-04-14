export const actionTypes = {
  CHANGE_LANGUAGE: 'CHANGE_LANGUAGE',
}

export function changeLanguage(language) {
  return {
    payload: { language },
    type: actionTypes.CHANGE_LANGUAGE,
  }
}

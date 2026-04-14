export const actionTypes = {
  TOGGLE_MODAL: 'TOGGLE_MODAL',
}

export function toggleModal() {
  return {
    type: actionTypes.TOGGLE_MODAL,
  }
}

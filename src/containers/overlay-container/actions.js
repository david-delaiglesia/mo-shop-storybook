export const actionTypes = {
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
  CLOSE_OVERLAY: 'CLOSE_OVERLAY',
  OPEN_OVERLAY: 'OPEN_OVERLAY',
}

export function toggleOverlay() {
  return {
    type: actionTypes.TOGGLE_OVERLAY,
  }
}

export function closeOverlay() {
  return {
    type: actionTypes.CLOSE_OVERLAY,
  }
}

export function openOverlay() {
  return {
    type: actionTypes.OPEN_OVERLAY,
  }
}

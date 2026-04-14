export const actionTypes = {
  SET_NETWORK_OFFLINE: 'SET_NETWORK_OFFLINE',
  SET_NETWORK_ONLINE: 'SET_NETWORK_ONLINE',
}

export function setOffline() {
  return {
    payload: { isOffline: true, offlineTimeStamp: Date.now() },
    type: actionTypes.SET_NETWORK_OFFLINE,
  }
}

export function setOnline() {
  return {
    payload: { isOffline: false },
    type: actionTypes.SET_NETWORK_ONLINE,
  }
}

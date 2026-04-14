export function serializeAddresses(response = { results: [] }) {
  return response.results.map(serializeAddress)
}

export function serializeAddress(address) {
  if (!address) return address

  return {
    id: address.id,
    address: address.address,
    detail: address.address_detail,
    comments: address.comments,
    enteredManually: address.entered_manually,
    latitude: address.latitude,
    longitude: address.longitude,
    permanent: address.permanent_address,
    postalCode: address.postal_code,
    town: address.town,
  }
}

export function deserializeAddress(address) {
  return {
    id: address.id,
    address: address.address,
    address_detail: address.detail,
    comments: address.comments,
    entered_manually: address.enteredManually,
    latitude: address.latitude,
    longitude: address.longitude,
    permanent_address: address.permanent,
    postal_code: address.postalCode,
    town: address.town,
  }
}

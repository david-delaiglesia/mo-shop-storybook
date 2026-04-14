function isPermanent(address) {
  return address.permanent
}

function getFormattedAddress(address) {
  let formatedAddress = address.address

  if (address.detail) {
    formatedAddress = formatedAddress + `, ${address.detail}`
  }

  return formatedAddress
}

function getDeliveryTown(address) {
  return `${address.postalCode}, ${address.town}`
}

function getDeliveryAddress(address) {
  const addressDetail = getFormattedAddress(address)
  const addressTown = getDeliveryTown(address)

  return `${addressDetail}, ${addressTown}`
}

function formatAddressQuery(address) {
  return [
    address.address_name,
    address?.address_number,
    address?.door_number,
    address?.floor_number,
    address?.town,
    address?.postal_code,
  ]
    .filter(Boolean)
    .join(',')
}

export const Address = {
  isPermanent,
  getFormattedAddress,
  getDeliveryTown,
  getDeliveryAddress,
  formatAddressQuery,

  build({
    flowId,
    street,
    number,
    postalCode,
    town,
    detail,
    comments,
    latitude,
    longitude,
  }) {
    const address = {
      flowId,
      street: street.trim(),
      number,
      postalCode,
      town,
      detail,
      comments,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }

    return address
  },
}

// @see https://developers.google.com/maps/documentation/javascript/reference/geocoder?hl=es-419#Geocoder

export class AddressComponentsBuilder {
  #addressComponents = []

  addRoute(route) {
    this.#addressComponents.push({ long_name: route, types: ['route'] })
    return this
  }

  addStreetNumber(streetNumber) {
    this.#addressComponents.push({
      long_name: streetNumber,
      types: ['street_number'],
    })
    return this
  }

  addPostalCode(postalCode) {
    this.#addressComponents.push({
      long_name: postalCode,
      types: ['postal_code'],
    })
    return this
  }

  addTown(town) {
    this.#addressComponents.push({
      long_name: town,
      types: ['administrative_area_level_2'],
    })
    return this
  }

  addCountry(country) {
    this.#addressComponents.push({ long_name: country, types: ['country'] })
    return this
  }

  build() {
    const currentAddressComponents = this.#addressComponents
    this.#addressComponents = []
    return currentAddressComponents
  }
}

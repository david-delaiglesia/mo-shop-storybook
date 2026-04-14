// @see https://developers.google.com/maps/documentation/javascript/reference/geocoder?hl=es-419#Geocoder
import { AddressComponentsBuilder } from './AddressComponentsBuilder'

export class GeocoderResponseBuilder {
  #data = {}

  add(address, { route, streetNumber, postalCode, town, country }) {
    const addressComponentsBuilder = new AddressComponentsBuilder()

    if (route) addressComponentsBuilder.addRoute(route)
    if (streetNumber) addressComponentsBuilder.addStreetNumber(streetNumber)
    if (postalCode) addressComponentsBuilder.addPostalCode(postalCode)
    if (town) addressComponentsBuilder.addTown(town)
    if (country) addressComponentsBuilder.addCountry(country)

    this.#data = {
      ...this.#data,
      [address]: {
        address_components: addressComponentsBuilder.build(),
        geometry: {
          location_type: 'GEOMETRIC_CENTER',
          location: { lat: () => 39.4699, lng: () => -0.3763 },
        },
      },
    }

    return this
  }

  build() {
    const currentData = this.#data
    this.#data = {}
    return currentData
  }
}

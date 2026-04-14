import { AddressResponse } from '../interfaces'

const baseAddress: AddressResponse = {
  id: 1,
  address: 'Calle Arquitecto Mora, 10',
  address_detail: 'Piso 8 Puerta 14',
  postal_code: '46010',
  latitude: '39.47318090',
  longitude: '-0.36310200',
  comments: 'Comments',
  permanent_address: true,
  entered_manually: true,
  town: 'València',
}

export const AddressMother = {
  arquitectoMora(): AddressResponse {
    return baseAddress
  },
}

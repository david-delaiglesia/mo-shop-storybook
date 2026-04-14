import { serializeAddresses } from '../serializer'

export const mockedAddresses = {
  results: [
    {
      address: 'Carrer de Sant Vicent Màrtir, 45',
      address_detail: null,
      comments: '',
      entered_manually: false,
      id: 7663,
      latitude: '39.47084790',
      longitude: '-0.37768950',
      permanent_address: false,
      postal_code: '46002',
      town: 'València',
    },
    {
      address: 'Calle Arquitecto Mora, 10',
      address_detail: null,
      comments: '',
      entered_manually: false,
      id: 7855,
      latitude: '39.47318090',
      longitude: '-0.36310200',
      permanent_address: true,
      postal_code: '46010',
      town: 'València',
    },
  ],
}

export const addressesListWithSingleAddress = {
  results: [
    {
      address: 'Carrer de Sant Vicent Màrtir, 45',
      address_detail: null,
      comments: '',
      entered_manually: false,
      id: 7663,
      latitude: '39.47084790',
      longitude: '-0.37768950',
      permanent_address: false,
      postal_code: '46002',
      town: 'València',
    },
  ],
}

export const serializedMockedAddresses = serializeAddresses(mockedAddresses)

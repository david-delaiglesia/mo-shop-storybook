const address = {
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

const secondaryAddress = {
  ...address,
  id: 2,
  address: 'Calle Colón, 10',
  permanent_address: false,
}

const addressFromDifferentWarehouse = {
  ...address,
  id: 3,
  address: 'Calle Mayor, 10',
  postal_code: '28001',
  comments: 'Comments',
  permanent_address: false,
  town: 'Madrid',
}

const addressFromBarcelonaWarehouse = {
  ...address,
  id: 4,
  address: 'Carrer Gran de Gracia, 10',
  postal_code: '08001',
  comments: 'Comments',
  permanent_address: false,
  town: 'Barcelona',
}

const addressRequestFromDifferentWarehouse = {
  address: 'Calle Mayor, 10',
  town: 'Madrid',
  address_detail: 'Piso 8 Puerta 14',
  postal_code: '28001',
  latitude: 0,
  longitude: 0,
  permanent_address: true,
  entered_manually: true,
}

const addressRequestFromInnacuratedFixedLocation = {
  address: 'Cebollas, 14',
  town: 'Madrid',
  address_detail: 'Piso 8 Puerta 14',
  postal_code: '46010',
  latitude: 39.4756457,
  longitude: -0.3968569,
  flow_id: '10000000-1000-4000-8000-100000000000',
}

const addressMapRequestFromInnacurateLocation = {
  address: '',
  town: 'Madrid',
  address_detail: 'Piso 8 Puerta 14',
  postal_code: '46010',
}

export const addressRequestAccuracy = {
  flowId: '10000000-1000-4000-8000-100000000000',
  street: 'Calle Arquitecto Mora',
  number: '10',
  postalCode: '46010',
  town: 'València',
}

export const addressRequest = {
  flow_id: '10000000-1000-4000-8000-100000000000',
  street: 'Calle Arquitecto Mora',
  number: '10',
  postal_code: '46010',
  town: 'València',
  detail: 'Piso 8 Puerta 14',
  latitude: 39.4780024,
  longitude: -0.4226101,
}

export const addressFormFill = {
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

export const addressResponse = {
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

export const secondaryAddressResponse = {
  ...addressResponse,
  id: 2,
  address: 'Calle Colón, 10',
  permanent_address: false,
}

export {
  address,
  secondaryAddress,
  addressFromDifferentWarehouse,
  addressRequestFromDifferentWarehouse,
  addressFromBarcelonaWarehouse,
  addressRequestFromInnacuratedFixedLocation,
  addressMapRequestFromInnacurateLocation,
}

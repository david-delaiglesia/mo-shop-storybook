const addressSuggestionWithoutNumber = {
  place_id: 'place1',
  description: 'Calle de Colón, Madrid, España',
  structured_formatting: {
    main_text: 'Calle de Colón',
    secondary_text: 'Madrid, España',
  },
  terms: [
    { offset: 0, value: 'Calle de Colón' },
    { offset: 19, value: 'Madrid' },
    { offset: 27, value: 'España' },
  ],
  types: ['street_address', 'geocode'],
}
const addressSuggestionWithNumber = {
  place_id: 'place2',
  description: 'Calle de Cristóbal Colón, 6, Madrid, España',
  structured_formatting: {
    main_text: 'Calle de Cristóbal Colón, 6',
    secondary_text: 'Madrid, España',
  },
  terms: [
    { offset: 0, value: 'Calle de Cristóbal Colón' },
    { offset: 26, value: '6' },
    { offset: 29, value: 'Madrid' },
    { offset: 38, value: 'España' },
  ],
  types: ['street_address', 'geocode'],
}

export { addressSuggestionWithNumber, addressSuggestionWithoutNumber }

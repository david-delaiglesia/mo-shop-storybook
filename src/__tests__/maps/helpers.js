export const mockAddressSuggestions = (suggestions) => {
  window.google.maps.places.AutocompleteSuggestion = {
    fetchAutocompleteSuggestions: vi.fn(() => Promise.resolve({ suggestions })),
  }
}

export const createAddressSuggestion = (
  placeId,
  { street, number, town = 'València', country = 'España' },
) => {
  let mainText = street
  if (number) {
    mainText += `, ${number}`
  }

  return {
    placePrediction: {
      placeId,
      mainText: {
        text: mainText,
      },
      secondaryText: {
        text: `${town}, ${country}`,
      },
      types: ['street_address', 'geocode'],
    },
  }
}

import { useEffect, useRef, useState } from 'react'

const createSuggestionFromPlacePrediction = ({ placePrediction }, index) => {
  return {
    placeId: placePrediction.placeId,
    position: index,
    primaryText: placePrediction.mainText.text,
    secondaryText: placePrediction.secondaryText.text,
    types: placePrediction.types,
  }
}

export const useAddressGeoSuggestions = (
  searchQuery,
  options = { offset: 3 },
) => {
  const [suggestions, setSuggestions] = useState([])

  const autocompleteServiceRef = useRef(null)
  if (autocompleteServiceRef.current === null) {
    autocompleteServiceRef.current =
      new window.google.maps.places.AutocompleteService()
  }

  const resetSuggestions = () => {
    setSuggestions([])
  }

  const fetchSuggestions = async () => {
    if (!searchQuery || searchQuery.length < options.offset) {
      resetSuggestions()
      return
    }

    try {
      const result =
        await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          {
            input: searchQuery,
            includedPrimaryTypes: [
              'establishment',
              'premise',
              'route',
              'street_address',
              'subpremise',
            ],
            includedRegionCodes: ['es'],
          },
        )

      setSuggestions(
        result.suggestions.map(createSuggestionFromPlacePrediction),
      )
    } catch {
      resetSuggestions()
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [searchQuery])

  return {
    suggestions,
    resetSuggestions,
  }
}

import { vi } from 'vitest'

import {
  addressSuggestionWithNumber,
  addressSuggestionWithoutNumber,
} from 'app/address/__scenarios__/addressSuggestion'

const eventMap = {}

export const windowGoogleMock = {
  google: {
    maps: {
      Animation: {
        DROP: function () {
          return {}
        },
      },
      importLibrary: async (libraryName) => {
        if (libraryName === 'places') {
          return Promise.resolve({
            SearchNearbyRankPreference: vi.fn(),
          })
        }
      },
      LatLng: function (lat, lng) {
        return {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          lat: () => {
            return this.latitude
          },
          lng: () => {
            return this.longitude
          },
        }
      },
      MapTypeId: {
        ROADMAP: 'roadmap',
        HYBRID: 'hybrid',
      },
      MapTypeControlStyle: {
        HORIZONTAL_BAR: 'horizontal_bar',
      },
      ControlPosition: {
        BOTTOM_RIGHT: 'bottom_right',
      },
      LatLngBounds: function (ne, sw) {
        return {
          getSouthWest: function () {
            return sw
          },
          getNorthEast: function () {
            return ne
          },
        }
      },
      OverlayView: function () {
        return {}
      },
      InfoWindow: function () {
        return {}
      },
      Marker: function () {
        return {
          setPosition: () => {
            return {}
          },
        }
      },
      MarkerImage: function () {
        return {}
      },
      Map: function () {
        return {
          panTo: () => {
            return {}
          },
          setZoom: () => {
            return {}
          },
          fitBounds: () => {
            return {}
          },
          dispatchEvent: (event) => eventMap[event](),
          addListener: (event, cb) => {
            eventMap[event] = cb
          },
          getCenter: () => ({
            lat: function () {
              return 39.4756457
            },
            lng: function () {
              return -0.3968569
            },
          }),
          setCenter: () => ({
            lat: function () {
              return 39.4756457
            },
            lng: function () {
              return -0.3968569
            },
          }),
          mapTypes: {
            hybrid: {
              name: 'Hybrid Map',
            },
          },
          getMapTypeId: vi.fn(() => 'hybrid'),
          getZoom: vi.fn().mockReturnValue(12),
        }
      },
      Point: function () {
        return {}
      },
      Size: function () {
        return {}
      },
      places: {
        AutocompleteService: function () {
          return {
            getPlacePredictions: (request, callback) => {
              callback([
                addressSuggestionWithoutNumber,
                addressSuggestionWithNumber,
              ])
            },
          }
        },
        Place: {
          searchNearby: () => {
            return {
              places: [
                {
                  id: 'PlaceId',
                  addressComponents: [
                    {
                      longText: '46009',
                      types: ['postal_code'],
                    },
                    {
                      longText: 'Valencia',
                      types: ['locality'],
                    },
                  ],
                },
              ],
            }
          },
        },
      },
      event: {
        clearListeners: vi.fn(),
      },
    },
  },
}

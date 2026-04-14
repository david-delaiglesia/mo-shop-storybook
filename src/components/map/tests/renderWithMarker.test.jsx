import { render } from '@testing-library/react'

import Map from '../Map'
import { expect, vi } from 'vitest'

it('should render a map with a marker', async () => {
  const size = vi.spyOn(window.google.maps, 'Size')
  const marker = vi.spyOn(window.google.maps, 'Marker')
  render(<Map latitude={39.4676542} longitude={-0.3744969} marker={true} />)

  expect(size).toHaveBeenCalledWith(65, 65)
  expect(marker).toHaveBeenCalledWith({
    animation: expect.any(Function),
    draggable: false,
    icon: { scaledSize: {}, url: '/src/components/map/assets/marker.png' },
    map: {
      panTo: expect.any(Function),
      setZoom: expect.any(Function),
      fitBounds: expect.any(Function),
      addListener: expect.any(Function),
      dispatchEvent: expect.any(Function),
      getCenter: expect.any(Function),
      getMapTypeId: expect.any(Function),
      mapTypes: { hybrid: { name: 'Hybrid Map' } },
      getZoom: expect.any(Function),
      setCenter: expect.any(Function),
    },
    position: {
      lat: expect.any(Function),
      latitude: 39.4676542,
      lng: expect.any(Function),
      longitude: -0.3744969,
    },
  })
})

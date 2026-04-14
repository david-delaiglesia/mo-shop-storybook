import { render } from '@testing-library/react'

import Map from '../Map'

it('should render the default map', async () => {
  const map = vi.spyOn(window.google.maps, 'Map')
  render(<Map latitude={39.4676542} longitude={-0.3744969} marker={false} />)

  expect(map).toHaveBeenCalledWith(expect.anything(), {
    center: {
      lat: expect.any(Function),
      latitude: 39.4676542,
      lng: expect.any(Function),
      longitude: -0.3744969,
    },
    clickableIcons: false,
    draggable: false,
    draggableCursor: 'default',
    fullscreenControl: false,
    zoom: 8,
  })
})

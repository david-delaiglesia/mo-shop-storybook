import { render, screen } from '@testing-library/react'
import { useState } from 'react'

import Map from '../Map'
import userEvent from '@testing-library/user-event'

it('should update the map info', async () => {
  const setPosition = vi.fn()
  const panTo = vi.fn()
  const setZoom = vi.fn()
  window.google.maps.Marker = vi.fn().mockImplementation(() => ({
    setPosition,
  }))
  window.google.maps.Map = vi.fn().mockImplementation(() => ({
    panTo,
    setZoom,
  }))

  const MapContainer = () => {
    const [latitude, setLatitude] = useState(39.4676542)

    return (
      <div>
        <button onClick={() => setLatitude(40.4676542)}>Change marker</button>
        <Map
          latitude={latitude}
          longitude={-0.3744969}
          marker={true}
          zoom={8}
        />
      </div>
    )
  }
  render(<MapContainer />)

  userEvent.click(screen.getByText('Change marker'))

  expect(setZoom).toHaveBeenCalledWith(8)
  expect(panTo).toHaveBeenCalledWith(
    expect.objectContaining({
      latitude: 40.4676542,
      longitude: -0.3744969,
    }),
  )
  expect(setPosition).toHaveBeenCalledWith(
    expect.objectContaining({
      latitude: 40.4676542,
      longitude: -0.3744969,
    }),
  )
})

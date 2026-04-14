import { render, screen } from '@testing-library/react'
import { useState } from 'react'

import Map from '../Map'
import userEvent from '@testing-library/user-event'

it('should remove the marker', async () => {
  const setPosition = vi.fn()
  window.google.maps.Marker = vi.fn().mockImplementation(() => ({
    setPosition,
  }))

  const MapContainer = () => {
    const [marker, setMarker] = useState(true)

    return (
      <div>
        <button onClick={() => setMarker(false)}>Remove marker</button>
        <Map latitude={39.4676542} longitude={-0.3744969} marker={marker} />
      </div>
    )
  }
  render(<MapContainer />)

  userEvent.click(screen.getByText('Remove marker'))

  expect(setPosition).toHaveBeenCalledWith(null)
})

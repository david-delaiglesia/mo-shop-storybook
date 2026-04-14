import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Overlay } from './Overlay'

const meta: Meta<typeof Overlay> = {
  title: 'Components/Overlay',
  component: Overlay,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls overlay visibility',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Overlay>

export const Closed: Story = {
  args: {
    open: false,
    children: <div style={{ padding: '20px', background: 'white', zIndex: 2, position: 'relative' }}>Overlay content</div>,
  },
}

export const Open: Story = {
  args: {
    open: true,
    children: (
      <div
        style={{
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          zIndex: 2,
          position: 'relative',
          margin: '100px auto',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h3>Modal Content</h3>
        <p>This content sits on top of the overlay</p>
      </div>
    ),
  },
}

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => setIsOpen(true)} style={{ padding: '8px 16px' }}>
          Open Overlay
        </button>
        <Overlay open={isOpen} onClick={() => setIsOpen(false)}>
          <div
            style={{
              padding: '40px',
              background: 'white',
              borderRadius: '8px',
              zIndex: 2,
              position: 'relative',
              margin: '100px auto',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <h3>Click the overlay to close</h3>
            <p>Or click this button:</p>
            <button onClick={() => setIsOpen(false)} style={{ padding: '8px 16px', marginTop: '12px' }}>
              Close
            </button>
          </div>
        </Overlay>
      </div>
    )
  },
}

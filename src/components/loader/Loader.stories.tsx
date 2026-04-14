import type { Meta, StoryObj } from '@storybook/react'

import Loader from './Loader'

const meta: Meta<typeof Loader> = {
  title: 'Components/Loader',
  component: Loader,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Loader>

export const Default: Story = {}

export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: '#333', padding: '40px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
}

export const InContainer: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          width: '300px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #eee',
          borderRadius: '8px',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

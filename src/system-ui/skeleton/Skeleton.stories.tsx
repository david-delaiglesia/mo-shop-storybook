import type { Meta, StoryObj } from '@storybook/react'

import { Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'System UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'text',
      description: 'Width of the skeleton (CSS value)',
    },
    height: {
      control: 'text',
      description: 'Height of the skeleton (CSS value)',
    },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: {
    width: '200px',
    height: '20px',
  },
}

export const Circle: Story = {
  args: {
    width: '48px',
    height: '48px',
  },
  decorators: [
    (Story) => (
      <div style={{ borderRadius: '50%', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
}

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px' }}>
      <Skeleton width="300px" height="180px" />
      <Skeleton width="200px" height="16px" />
      <Skeleton width="150px" height="14px" />
      <Skeleton width="80px" height="32px" />
    </div>
  ),
}

export const ListPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Skeleton width="48px" height="48px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  ),
}

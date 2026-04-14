import type { Meta, StoryObj } from '@storybook/react'

import { Divider } from './Divider'

const meta: Meta<typeof Divider> = {
  title: 'System UI/Divider',
  component: Divider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Divider>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
}

export const WithText: Story = {
  args: {
    orientation: 'horizontal',
    children: 'or',
  },
}

export const InContext: Story = {
  render: () => (
    <div>
      <p>Section above the divider</p>
      <Divider>or</Divider>
      <p>Section below the divider</p>
    </div>
  ),
}

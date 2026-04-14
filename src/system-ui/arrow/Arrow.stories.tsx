import type { Meta, StoryObj } from '@storybook/react'

import Arrow from './Arrow'

const meta: Meta<typeof Arrow> = {
  title: 'System UI/Arrow',
  component: Arrow,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'radio',
      options: ['left', 'right', 'up', 'down'],
      description: 'Direction of the arrow',
    },
    isVisible: {
      control: 'boolean',
      description: 'Visibility of the arrow',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label',
    },
  },
  args: {
    click: () => alert('Arrow clicked!'),
  },
}

export default meta
type Story = StoryObj<typeof Arrow>

export const Left: Story = {
  args: {
    direction: 'left',
    isVisible: true,
  },
}

export const Right: Story = {
  args: {
    direction: 'right',
    isVisible: true,
  },
}

export const Disabled: Story = {
  args: {
    direction: 'right',
    isVisible: true,
    disabled: true,
  },
}

export const Hidden: Story = {
  args: {
    direction: 'right',
    isVisible: false,
  },
}

export const NavigationPair: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '200px', alignItems: 'center' }}>
      <Arrow direction="left" click={() => {}} isVisible />
      <span>Content</span>
      <Arrow direction="right" click={() => {}} isVisible />
    </div>
  ),
}

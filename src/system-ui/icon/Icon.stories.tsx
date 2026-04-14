import type { Meta, StoryObj } from '@storybook/react'

import Icon from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'System UI/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'text',
      description: 'Icon name (maps to CSS class icon-{name})',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class',
    },
    ariaHidden: {
      control: 'boolean',
      description: 'Whether to hide the icon from assistive technology',
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    icon: 'big-chevron',
  },
}

export const AriaHidden: Story = {
  args: {
    icon: 'big-chevron',
    ariaHidden: true,
  },
}

export const WithCustomClass: Story = {
  args: {
    icon: 'big-chevron',
    className: 'custom-icon-class',
  },
}

import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import Checkbox from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'System UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checked state of the checkbox',
    },
    label: {
      control: 'text',
      description: 'Label text displayed next to the checkbox',
    },
    inputLabel: {
      control: 'text',
      description: 'Aria-label for the input element',
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {
  args: {
    checked: false,
    label: 'Accept terms and conditions',
    onChange: () => {},
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Accept terms and conditions',
    onChange: () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox
        checked={checked}
        label="Click me to toggle"
        onChange={() => setChecked(!checked)}
      />
    )
  },
}

export const WithAriaLabel: Story = {
  args: {
    checked: false,
    label: 'Remember me',
    inputLabel: 'Remember my login credentials',
    onChange: () => {},
  },
}

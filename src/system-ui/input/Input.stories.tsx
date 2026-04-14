import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import Input from './Input'

const meta: Meta<typeof Input> = {
  title: 'System UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    size: {
      control: 'radio',
      options: ['default', 'big'],
      description: 'Input size variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    label: 'Email',
    value: '',
    inputId: 'email-input',
  },
}

export const WithValue: Story = {
  args: {
    label: 'Email',
    value: 'user@example.com',
    inputId: 'email-input-filled',
  },
}

export const BigSize: Story = {
  args: {
    label: 'Full Name',
    value: '',
    size: 'big',
    inputId: 'name-input',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Email',
    value: 'disabled@example.com',
    disabled: true,
    inputId: 'disabled-input',
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    inputId: 'error-input',
    validation: {
      type: 'error',
      message: 'Please enter a valid email address',
    },
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: '320px' }}>
        <Input
          label="Type something"
          value={value}
          onChange={(e: any) => setValue(e.target.value)}
          inputId="interactive-input"
        />
      </div>
    )
  },
}

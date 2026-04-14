import type { Meta, StoryObj } from '@storybook/react'

import StrengthBar from './StrengthBar'

const meta: Meta<typeof StrengthBar> = {
  title: 'Components/StrengthBar',
  component: StrengthBar,
  tags: ['autodocs'],
  args: {
    email: 'user@example.com',
  },
  argTypes: {
    password: {
      control: 'text',
      description: 'Password to evaluate strength for',
    },
    email: {
      control: 'text',
      description: 'User email (username is extracted to check against reserved words)',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StrengthBar>

export const Empty: Story = {
  args: {
    password: '',
  },
}

export const TooShort: Story = {
  args: {
    password: 'abc',
  },
}

export const Weak: Story = {
  args: {
    password: 'abcdef',
  },
}

export const Strong: Story = {
  args: {
    password: 'Str0ng!Pass#2024',
  },
}

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Empty</p>
        <StrengthBar password="" email="user@example.com" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Too short: "abc"</p>
        <StrengthBar password="abc" email="user@example.com" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Weak: "abcdef"</p>
        <StrengthBar password="abcdef" email="user@example.com" />
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Strong: "Str0ng!Pass#"</p>
        <StrengthBar password="Str0ng!Pass#" email="user@example.com" />
      </div>
    </div>
  ),
}

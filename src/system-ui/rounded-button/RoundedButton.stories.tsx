import type { Meta, StoryObj } from '@storybook/react'

import { RoundedButton } from './RoundedButton'

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const meta: Meta<typeof RoundedButton> = {
  title: 'System UI/RoundedButton',
  component: RoundedButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label for the button',
    },
  },
}

export default meta
type Story = StoryObj<typeof RoundedButton>

export const WithPlusIcon: Story = {
  args: {
    Icon: PlusIcon,
    label: 'Add item',
    onClick: () => alert('Clicked!'),
  },
}

export const WithCloseIcon: Story = {
  args: {
    Icon: CloseIcon,
    label: 'Close',
    onClick: () => alert('Closed!'),
  },
}

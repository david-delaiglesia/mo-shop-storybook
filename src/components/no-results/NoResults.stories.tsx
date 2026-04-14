import type { Meta, StoryObj } from '@storybook/react'

import NoResults from './NoResults'

const meta: Meta<typeof NoResults> = {
  title: 'Components/NoResults',
  component: NoResults,
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Custom no-results message (i18n key)',
    },
  },
}

export default meta
type Story = StoryObj<typeof NoResults>

export const Default: Story = {
  args: {},
}

export const CustomText: Story = {
  args: {
    text: 'No products found for your search',
  },
}

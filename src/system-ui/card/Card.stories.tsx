import type { Meta, StoryObj } from '@storybook/react'

import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'System UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    hover: {
      control: 'boolean',
      description: 'Enables hover effect on the card',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'li'],
      description: 'Polymorphic HTML element to render',
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: '24px' }}>
        <h3>Card Title</h3>
        <p>This is a basic card component used as a container.</p>
      </div>
    ),
  },
}

export const WithHover: Story = {
  args: {
    hover: true,
    children: (
      <div style={{ padding: '24px' }}>
        <h3>Hoverable Card</h3>
        <p>This card has a hover effect. Try hovering over it.</p>
      </div>
    ),
  },
}

export const AsArticle: Story = {
  args: {
    as: 'article',
    children: (
      <div style={{ padding: '24px' }}>
        <h3>Article Card</h3>
        <p>This card renders as an &lt;article&gt; element.</p>
      </div>
    ),
  },
}

export const MultipleCards: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Card hover>
        <div style={{ padding: '16px' }}>
          <h4>Product 1</h4>
          <p>Description</p>
        </div>
      </Card>
      <Card hover>
        <div style={{ padding: '16px' }}>
          <h4>Product 2</h4>
          <p>Description</p>
        </div>
      </Card>
      <Card hover>
        <div style={{ padding: '16px' }}>
          <h4>Product 3</h4>
          <p>Description</p>
        </div>
      </Card>
    </div>
  ),
}

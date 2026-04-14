import type { Meta, StoryObj } from '@storybook/react'

import Tooltip, { TooltipPosition } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    tooltipPosition: {
      control: 'select',
      options: Object.values(TooltipPosition),
      description: 'Position of the tooltip relative to the trigger',
    },
    text: {
      control: 'text',
      description: 'Tooltip text content',
    },
    title: {
      control: 'text',
      description: 'Optional tooltip title',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Bottom: Story = {
  args: {
    tooltipPosition: TooltipPosition.BOTTOM,
    text: 'This is a tooltip message',
    children: <button style={{ padding: '8px 16px' }}>Hover me</button>,
  },
}

export const Top: Story = {
  args: {
    tooltipPosition: TooltipPosition.TOP,
    text: 'Tooltip on top',
    children: <button style={{ padding: '8px 16px' }}>Hover me</button>,
  },
}

export const Left: Story = {
  args: {
    tooltipPosition: TooltipPosition.LEFT,
    text: 'Tooltip on the left',
    children: <button style={{ padding: '8px 16px' }}>Hover me</button>,
  },
}

export const Right: Story = {
  args: {
    tooltipPosition: TooltipPosition.RIGHT,
    text: 'Tooltip on the right',
    children: <button style={{ padding: '8px 16px' }}>Hover me</button>,
  },
}

export const WithTitle: Story = {
  args: {
    tooltipPosition: TooltipPosition.BOTTOM,
    title: 'Important Info',
    text: 'This tooltip has both a title and description text.',
    children: <button style={{ padding: '8px 16px' }}>Hover for details</button>,
  },
}

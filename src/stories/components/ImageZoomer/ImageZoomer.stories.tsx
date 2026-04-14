import type { Meta, StoryObj } from '@storybook/react'
import { ImageZoomer } from './ImageZoomer'

const meta: Meta<typeof ImageZoomer> = {
  title: 'Components / ImageZoomer',
  component: ImageZoomer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    alt: 'Producto Mercadona',
    width: 400,
    height: 400,
    showBadge: true,
  },
}
export default meta
type Story = StoryObj<typeof ImageZoomer>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    src: 'https://picsum.photos/seed/mercadona/400/400',
    alt: 'Foto del producto',
  },
}

export const SmallSize: Story = {
  args: {
    width: 250,
    height: 250,
  },
}

export const NoBadge: Story = {
  args: {
    showBadge: false,
  },
}

export const LargeImage: Story = {
  args: {
    src: 'https://picsum.photos/seed/grocery/600/600',
    width: 600,
    height: 600,
  },
}

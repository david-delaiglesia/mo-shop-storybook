import type { Meta, StoryObj } from '@storybook/react'
import { IconLink } from './IconLink'

const meta: Meta<typeof IconLink> = {
  title: 'Components / IconLink',
  component: IconLink,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    icon: '📍',
    label: 'Ver mapa',
    variant: 'primary',
    size: 'medium',
  },
}
export default meta
type Story = StoryObj<typeof IconLink>

export const Default: Story = {}

export const Secondary: Story = {
  args: {
    icon: '📞',
    label: 'Contacto',
    variant: 'secondary',
  },
}

export const Small: Story = {
  args: {
    icon: '✏️',
    label: 'Editar',
    size: 'small',
  },
}

export const Large: Story = {
  args: {
    icon: '🛒',
    label: 'Ir al carrito',
    size: 'large',
  },
}

export const Disabled: Story = {
  args: {
    icon: '🔒',
    label: 'No disponible',
    disabled: true,
  },
}

export const AsAnchor: Story = {
  args: {
    icon: '🌐',
    label: 'Visitar web',
    href: '#',
  },
}

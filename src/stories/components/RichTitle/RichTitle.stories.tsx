import type { Meta, StoryObj } from '@storybook/react'
import { RichTitle } from './RichTitle'

const meta: Meta<typeof RichTitle> = {
  title: 'Components / RichTitle',
  component: RichTitle,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'Tu carrito de la compra',
    subtitle: '12 productos seleccionados',
    icon: '🛒',
    size: 'medium',
  },
}
export default meta
type Story = StoryObj<typeof RichTitle>

export const Default: Story = {}

export const Small: Story = {
  args: {
    title: 'Detalles del producto',
    subtitle: 'Leche entera 1L',
    icon: '📦',
    size: 'small',
  },
}

export const Large: Story = {
  args: {
    title: 'Bienvenido a Mercadona Online',
    subtitle: 'Haz tu compra desde casa con entrega a domicilio',
    icon: '🏠',
    size: 'large',
  },
}

export const NoIcon: Story = {
  args: {
    title: 'Mis pedidos recientes',
    subtitle: 'Revisa el estado de tus últimos pedidos',
    icon: undefined,
  },
}

export const Centered: Story = {
  args: {
    title: 'Pedido confirmado',
    subtitle: 'Recibirás tu pedido mañana entre las 10:00 y las 12:00',
    icon: '✅',
    centered: true,
  },
}

export const NoSubtitle: Story = {
  args: {
    title: 'Categorías',
    icon: '📋',
    subtitle: undefined,
  },
}
